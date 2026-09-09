package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entites.Message;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

public record MessageResponse(UUID id, UUID queueId, String site, String type, String recipient, String subject,
                              String status, int attemptCount, Instant availableAt, Instant requestedAt,
                              Instant finishedAt, Instant createdAt, Instant updatedAt) {
    public static MessageResponse fromMessage(Message message) {
        return new MessageResponse(message.getId(), message.getQueueId(), message.getSite(), message.getType(),
                message.getRecipient(), message.getSubject(), message.getStatus().name().toLowerCase(Locale.ROOT),
                message.getAttemptCount(), message.getAvailableAt(), message.getRequestedAt(),
                message.getFinishedAt(), message.getCreatedAt(), message.getUpdatedAt());
    }
}
