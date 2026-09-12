package ch.oliumbi.assets.data.responses;

import ch.oliumbi.assets.data.entities.Document;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(UUID id, String site, boolean visible, String slug, String filename,
                               long bytes, String checksum, Instant createdAt, Instant updatedAt) {
    public static DocumentResponse fromDocument(Document document) {
        return new DocumentResponse(document.getId(), document.getSite(), document.isVisible(), document.getSlug(),
                document.getFilename(), document.getByteCount(), document.getChecksum(),
                document.getCreatedAt(), document.getUpdatedAt());
    }
}
