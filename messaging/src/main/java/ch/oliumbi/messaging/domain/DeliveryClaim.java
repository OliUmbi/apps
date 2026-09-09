package ch.oliumbi.messaging.domain;

import java.util.UUID;

public record DeliveryClaim(
        UUID messageId,
        int attempt,
        String site,
        String type,
        String sender,
        String recipient,
        String subject,
        String text,
        String html) {
}
