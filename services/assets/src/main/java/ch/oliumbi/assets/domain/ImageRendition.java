package ch.oliumbi.assets.domain;

public record ImageRendition(ImageSize size, ImageFormat format, int width, int height, StoredFile file) {
}