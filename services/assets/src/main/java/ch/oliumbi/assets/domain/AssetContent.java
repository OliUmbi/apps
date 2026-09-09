package ch.oliumbi.assets.domain;

import java.nio.file.Path;

public record AssetContent(Path path, String contentType, long bytes, String checksum, String downloadName) {
}