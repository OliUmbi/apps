# Assets design notes

This document records the rationale behind the current implementation and the
tradeoffs to revisit when production usage provides representative data.

## Agreed direction

- Local persistent files, PostgreSQL metadata, immutable image bytes, editable visibility.
- One multipart upload creates the file and metadata together; site content can link the returned UUID later.
- Two shard levels: media/images/41/5d/<uuid>/<variant>.jpg (or .png), with the same layout under documents. Upload staging stays on the same volume.
- Accept JPEG and PNG only for now; reject other image formats, animation and multiple-image/page containers. Preserve PNG output, including transparency.
- Keep separate image/document APIs and services, with shared storage code inside assets. Constructor injection, validated properties records, ordinary Spring Data repositories.
- PDFs are downloads only. Preserve their bytes, stream them as application/pdf with Content-Disposition: attachment and nosniff. No PDFBox, PDF rendering, page counting or recompression. Basic signature/type checks reject obvious mismatches but cannot prove a PDF is valid or harmless.

## Image processing and metadata

Never retain the raw uploaded image as an original. Decode into pixels, apply orientation/color conversion, and encode fresh output without copying source metadata. Remove EXIF/GPS, XMP/IPTC, comments, thumbnails, timestamps and source profiles from every retained image, including the retained regeneration master. Delete the raw staging file after processing; cleanup also handles interrupted uploads.

Convert colors to sRGB before discarding the source profile. Necessary encoding structure (dimensions, compression tables and any fixed output color declaration) remains; user-supplied descriptive metadata does not. Verify the chosen writers' output rather than assuming a metadata-extractor library strips anything. Database fields such as dimensions and byte counts are service metadata and stay.

**Orientation explained:** some phone photos store sideways pixels plus an EXIF instruction saying “rotate 90 degrees when displayed.” Removing that instruction alone makes the photo appear sideways. Apply its rotation or mirror operation to the pixels first, then discard it. This preserves the intended appearance; it does not crop, stretch or force an aspect ratio. Resizing preserves the resulting proportions, with no legacy aspect-ratio correction.

## Dependencies

Keep existing Spring/shared dependencies and add Boot's validation starter. Manage versions in the services parent; declare image dependencies only in assets.

| Library | Recommendation |
| --- | --- |
| net.coobird:thumbnailator:0.4.21 | Resizing and JPEG quality control; avoids hand-written scaling. Keep it as the single resizing library. [Upstream](https://github.com/coobird/thumbnailator). |
| com.twelvemonkeys.imageio:imageio-jpeg:3.15.0 | Robust JPEG decoding, including less conventional color encodings. Use only the JPEG module; JDK ImageIO supplies PNG support. Enforce the JPEG/PNG allowlist even if other readers are present on the classpath. [Formats](https://github.com/haraldk/TwelveMonkeys), [release](https://github.com/haraldk/TwelveMonkeys/releases/tag/twelvemonkeys-3.15.0). |
| com.drewnoakes:metadata-extractor:2.19.0 | Read orientation before decoding/normalizing once for all sizes. It reads metadata; fresh image encoding removes it. Test orientation for every enabled input format rather than assuming all readers handle it identically. [Upstream](https://github.com/drewnoakes/metadata-extractor). |

Use JDK Files/Path and Spring FileSystemResource for storage/downloads. No PDF library, broker, generic media framework or native codec dependency initially. Additional codecs can be considered if the accepted formats expand later.

## Sizes and compression

| Preset | Width | Initial JPEG target |
| --- | ---: | ---: |
| xs | 320px | 15–35 KiB |
| sm | 640px | 35–80 KiB |
| md | 768px | 50–110 KiB |
| lg | 1024px | 80–170 KiB |
| xl | 1280px | 120–240 KiB |
| 2xl | 1536px | 170–330 KiB |

Keep proportions and never upscale. Larger presets reuse the largest available rendition and report its actual dimensions. Default public size: xl. JPEG quality starts at 0.82, then tries 0.76 and 0.70 if oversized, always from the resized pixels. Budgets are soft: preserve quality rather than forcing every image under a byte ceiling. PNG stays lossless, preserves transparency and uses lossless compression; JPEG targets do not apply to it.

## API and caching

The previous site segment on documents disambiguated site-local slugs; image UUIDs were already globally unique. With globally unique document slugs, neither public route needs a site:

| Operation | Route |
| --- | --- |
| Public content | GET /images/{id}?size=xl; GET /documents/{slug} |
| Internal lists / upload | GET or POST /internal/images?site=...; equivalent /internal/documents |
| Internal metadata / content | GET /internal/images/{id}?site=...; GET /internal/images/{id}/content?site=...&size=...; equivalent document routes |
| Visibility / deletion | PATCH /internal/images/{id}/visibility?site=...; DELETE /internal/images/{id}?site=...; equivalent document routes |

Require site on internal operations and verify it against the row. Lists are paginated. The internal token stays server-side; Studio checks user/site permissions before forwarding. Document slug uniqueness is enforced globally by the database.

**Chosen cache policy:** public images use public, max-age=604800, immutable, must-revalidate (seven days); private/internal image content uses private, max-age=300, must-revalidate (five minutes). Include content-based ETags. Repeated views can reuse fresh cached images without contacting the server. Check access before any origin response, including 304; metadata and errors use no-store. Studio must forward the private policy and clear displayed private images on logout.

Hiding/deleting blocks new origin reads immediately, but previously cached public images may remain reusable for seven days, private ones for five minutes. This is the deliberate tradeoff for fewer roundtrips; cached/downloaded copies cannot be recalled. Never expose the filesystem directly. [Cache directive semantics](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control).

Public PDF downloads use public, no-cache with ETags because slug URLs may eventually be reused; private PDFs use private, no-store. Image replacements always receive new UUIDs; do not overwrite existing variants.

## Database and lifecycle

The schema is open to expansion. Start with image, image_variant and document tables: site, visibility, MIME type, byte count, checksum; image dimensions and per-variant details; globally unique document slug. Store sanitized master dimensions, format, byte count and checksum as well. Keep created_at/updated_at last. Use enums for known variants/formats. No deletion state machine is needed.

Creation: stage and process outside a DB transaction, publish the completed directory, then commit metadata. Remove unpublished files on confirmed failure; reconcile uncertain commits before removing files.

Deletion: commit DB deletion first, then attempt file deletion independently. A filesystem failure must not roll back the DB deletion. Return success only once the DB commit succeeds; DB availability cannot literally be guaranteed. Missing files count as already deleted. Log leftovers; a bounded periodic orphan sweep can retry both upload leftovers and deletion leftovers without a queue/table. Only remove sufficiently old unreferenced UUID directories, with a grace period longer than the maximum active upload duration. Cached images follow the policy above.

Review referencing foreign keys: disposable image-link rows should cascade, while optional content references can become null. Current SET NULL references involving primary-key image columns need correction. Edit initial migrations directly during development.

## Confirmed limits and regeneration

Accept uploads up to 20 MiB, 40 megapixels and 12,000px maximum side for images; 50 MiB for PDFs. Start with one concurrent image-processing operation and validate dimensions before full decoding. These are input limits, not rendition targets. The legacy XL result below 1 MB is a useful comparison point; keep the smaller soft JPEG budgets above and verify them against representative uploads.

**Recommended master policy:** retain a private, sanitized master with a maximum long edge of 3072px, preserving proportions and never upscaling. Keep JPEG sources as JPEG at quality 0.90 and PNG sources as losslessly encoded PNG. This avoids expanding photographs into full-resolution PNGs while retaining headroom above the 1536px rendition.

Use approximately 2 MiB for JPEG masters and 8 MiB for PNG masters as tuning targets, not rejection thresholds. Pixel bounds control growth; detailed PNGs can still be larger. Measure total storage on actual images before tightening these values. A PNG master remains losslessly encoded after any spatial downscaling; downscaling itself discards resolution.

Generate the initial variants from the normalized upload pixels. Future regeneration uses the master and is limited to its retained resolution; JPEG masters also incur a further lossy encode when regenerated. This is a deliberate storage/quality compromise, not archival preservation. Changed published renditions receive new URLs/asset IDs rather than overwriting existing cached content.

Detect animation/multiple images explicitly before processing: do not trust a decoder that returns only the first image. In particular, reject PNG animation control chunks (APNG) and multi-picture JPEG containers; malformed or unsupported containers fail validation. Ordinary multipage PDF downloads remain supported—the animation/page restriction applies to images.

## Open questions

None remain blocking. The master settings above are implementation defaults to validate with real uploads, not additional approval requests.
## Verification priorities

Verify metadata absence, orientation, transparency, format rejection, cache
behavior, and partial failures on Java 25. Add representative tests before
tuning storage or quality limits.
