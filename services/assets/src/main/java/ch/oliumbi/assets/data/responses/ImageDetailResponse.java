package ch.oliumbi.assets.data.responses;

import ch.oliumbi.assets.data.entites.Image;

import java.util.List;

public record ImageDetailResponse(ImageResponse image, List<VariantResponse> variants) {
    public static ImageDetailResponse fromImage(Image image) {
        return new ImageDetailResponse(ImageResponse.fromImage(image),
                image.getVariants().stream().map(VariantResponse::fromVariant).toList());
    }
}
