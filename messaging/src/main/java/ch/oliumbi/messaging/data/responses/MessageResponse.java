package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entites.Message;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        String site,
        String type,
        String recipient,
        String subject,
        String status,
        int attemptCount,
        Instant availableAt,
        Instant requestedAt,
        Instant finishedAt,
        String failureCode,
        String failureMessage,
        Instant createdAt,
        Instant updatedAt) {

    public static MessageResponse fromMessage(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSite(),
                message.getType(),
                message.getRecipient(),
                message.getSubject(),
                message.getStatus(),
                message.getAttemptCount(),
                message.getAvailableAt(),
                message.getRequestedAt(),
                message.getFinishedAt(),
                message.getFailureCode(),
                message.getFailureMessage(),
                message.getCreatedAt(),
                message.getUpdatedAt());
    }
}
