package ch.oliumbi.messaging;

import tools.jackson.databind.JsonNode;

import java.util.UUID;

record MessageRequest(
        UUID id,
        String messageType,
        String recipientEmail,
        String locale,
        JsonNode payload,
        String correlationKey) {
}
