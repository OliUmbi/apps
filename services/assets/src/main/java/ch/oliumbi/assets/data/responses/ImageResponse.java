package ch.oliumbi.assets.data.responses;

import ch.oliumbi.assets.data.entites.Image;

import java.time.Instant;
import java.util.UUID;

public record ImageResponse(UUID id, String site, boolean visible, Instant createdAt, Instant updatedAt) {
    public static ImageResponse fromImage(Image image) {
        return new ImageResponse(image.getId(), image.getSite(), image.isVisible(), image.getCreatedAt(), image.getUpdatedAt());
    }
}
