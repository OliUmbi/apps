package ch.oliumbi.assets.domain;

public record StoredFile(String key, String contentType, long bytes, String checksum) {
}