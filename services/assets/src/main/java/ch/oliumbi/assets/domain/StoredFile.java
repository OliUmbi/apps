package ch.oliumbi.assets.domain;

/**
 * The SHA-256 checksum supplies the content ETag without reading the file on every request.
 */
public record StoredFile(String key, String contentType, long bytes, String checksum) {
}
