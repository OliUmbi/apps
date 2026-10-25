package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entities.Message;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

public record MessageResponse(UUID id, UUID queueId, String site, String type, String sender, String recipient,
                              String replyTo, String subject, String status, int attemptCount, Instant availableAt,
                              Instant lockedAt, Instant requestedAt, Instant finishedAt, Instant createdAt,
                              Instant updatedAt) {
    public static MessageResponse fromMessage(Message message) {
        return new MessageResponse(message.getId(), message.getQueueId(), message.getSite(), message.getType(),
                message.getSender(), message.getRecipient(), message.getReplyTo(), message.getSubject(),
                message.getStatus().name().toLowerCase(Locale.ROOT),
                message.getAttemptCount(), message.getAvailableAt(), message.getLockedAt(), message.getRequestedAt(),
                message.getFinishedAt(), message.getCreatedAt(), message.getUpdatedAt());
    }
}
