package ch.oliumbi.messaging;

import java.time.Instant;
import java.util.UUID;

record OutboxMessage(
        UUID id,
        String messageType,
        String recipientEmail,
        String locale,
        String payload,
        String correlationKey,
        String status,
        int attemptCount,
        Instant createdAt,
        String lastError) {
}
