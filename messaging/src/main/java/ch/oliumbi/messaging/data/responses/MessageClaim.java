package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entites.Message;

import java.util.UUID;

public record MessageClaim(
        UUID id,
        int attemptNumber,
        String type,
        String sender,
        String recipient,
        String subject,
        String text,
        String html) {

    public static MessageClaim fromMessage(Message message) {
        return new MessageClaim(
                message.getId(),
                message.getAttemptCount(),
                message.getType(),
                message.getSender(),
                message.getRecipient(),
                message.getSubject(),
                message.getText(),
                message.getHtml());
    }
}
