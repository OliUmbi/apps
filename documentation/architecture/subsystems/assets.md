# Assets

Image and document storage. File content lives under a configured local storage
root; metadata and visibility live in PostgreSQL.

Full behavior and limits: [services/assets/README.md](../../../services/assets/README.md).

## Responsibility

Accept an upload, validate it, derive bounded renditions, store it immutably, and
serve it with correct caching. Public reads are unauthenticated only for visible
assets; every management operation requires the internal bearer token.

## Inside

```text
services/assets/
  controller/   upload, read, visibility and delete endpoints
  service/      storage coordination, cleanup and visibility rules
  processing/   image inspection, decode, normalize, resize, encode
  storage/      paths, staging, atomic publish, containment
```

`ImageProcessor` coordinates validation and the processing concurrency limit.
Helpers inspect containers, decode bounded pixel data, normalize orientation and
color, resize, and encode metadata-free output. A PDF is stored byte-for-byte.

## Storage layout

UUIDs use two shard directories to avoid very large flat folders:

```text
media/images/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/master.jpg
media/images/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/md.jpg
media/documents/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/original.pdf
```

Uploads are staged on the same volume and atomically published. A storage root
must not be shared by multiple service instances because upload activity
tracking is process-local.

## Flow: upload

1. Studio sends the file with the internal token and the site.
2. Assets rejects a known oversize at request time (413) and enforces a streaming
   limit during staging as defense in depth.
3. Images are validated by container, decoded within a pixel bound, normalized,
   stripped of metadata and encoded into configured sizes. PDFs are preserved.
4. Files are published atomically; metadata is committed.
5. A response returns the asset id and metadata to Studio.

## Flow: public read

1. A site server function calls the public assets endpoint without management
   credentials. Assets checks visibility, then returns the rendition with a
   content-derived `ETag` and explicit `Cache-Control`.
3. A conditional request returns 304.
4. Unknown ids and mismatched sites return 404 everywhere, including deletion.

## Limits

| Kind | Limit |
| --- | --- |
| image upload | 20 MiB, 40 megapixels, 12,000 px maximum side |
| PDF | 50 MiB |
| variants | configured widths, qualities and byte budgets |

Content is immutable: changing visibility is allowed, replacing content creates a
new asset. When presets clamp to the same width, later sizes reuse the first
size's file while metadata rows stay distinct.

## Deletion and cleanup

Deletion commits metadata first and removes files afterwards. A failed file
removal is logged and left for orphan cleanup; metadata is not resurrected.
Cleanup removes old staging files and unreferenced asset directories after a
grace period. Each sweep examines a bounded number of candidates, resumes where
the previous run stopped, and does database work outside the upload bookkeeping
lock so uploads are never blocked. This closed R18.

## Invariants

1. Stored content never changes in place.
2. Every management call authenticates; every read is site- and visibility-scoped.
3. Size and pixel limits are enforced before expensive work.
4. Paths stay inside the storage root.
5. Metadata commits before file removal; cleanup is idempotent and resumable.

## Known gaps

- Windows junction containment is hardened in code (symbolic-link roots and
  ancestors are rejected) and awaits a one-time junction verification; see
  [TD-05](../../work/tech-debt.md#td-05).
- Image publication and retention when linked content outlives an image is still
  an open product decision ([open work](../../work/open-work.md)).
