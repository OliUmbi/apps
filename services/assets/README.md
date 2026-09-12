# Assets

The assets service stores image and PDF metadata in PostgreSQL and file content
under a configured local storage root. Public reads are unauthenticated only for
visible assets; every management operation requires the assets internal bearer
token.

## API behavior

- Image upload accepts JPEG and PNG, normalizes orientation and color, strips
  source metadata, and creates bounded responsive renditions.
- Document upload accepts PDFs and preserves their bytes.
- Images are addressed by UUID; documents have a globally unique slug.
- Content responses include content-derived ETags and explicit cache policies.
- Visibility can change, but stored content is immutable. Replacing content
  creates a new asset.
- Deletion commits metadata first and removes files afterward. A failed file
  removal is logged and left for orphan cleanup, without resurrecting metadata.

## Storage layout

UUIDs use two shard directories to avoid very large flat folders:

```text
media/images/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/master.jpg
media/images/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/md.jpg
media/documents/41/5d/415de823-576d-48b0-b9e6-c9fab674ca20/original.pdf
```

Uploads are staged on the same volume and atomically published. Cleanup removes
old staging files and unreferenced asset directories after a grace period. A
storage root must not be shared by multiple service instances because upload
activity tracking is process-local.

## Processing and limits

`ImageProcessor` coordinates validation and the processing concurrency limit.
Its focused helpers inspect containers, decode bounded pixel data, normalize
orientation and color, resize images, and encode metadata-free output.

Current upload limits are 20 MiB, 40 megapixels, and a 12,000 px maximum side for
images; PDFs are limited to 50 MiB. Image variants follow the configured width,
quality, and byte budgets. Detailed rationale is retained in
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Development

Run from `services/`:

```text
mvn -pl assets -am package
```

The service listens on port 8083 by default. Configuration lives in
`src/main/resources/application.yaml`; the shared startup loader reads the
repository's `.env.development` for local runs.
