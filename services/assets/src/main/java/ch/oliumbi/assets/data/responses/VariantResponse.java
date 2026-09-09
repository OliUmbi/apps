package ch.oliumbi.assets.data.responses;

import ch.oliumbi.assets.data.entites.ImageVariant;

public record VariantResponse(String size, String contentType, int width, int height, long bytes, String checksum) {
    public static VariantResponse fromVariant(ImageVariant variant) {
        return new VariantResponse(variant.getSize().value(), variant.getFormat().contentType(),
                variant.getWidth(), variant.getHeight(), variant.getByteCount(), variant.getChecksum());
    }
}