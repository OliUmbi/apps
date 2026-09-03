package ch.oliumbi.messaging;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
class MessagingService {
    private static final Set<String> MESSAGE_TYPES = Set.of(
            "email", "newsletter.confirmation", "newsletter.welcome");
    private static final Set<String> LOCALES = Set.of("de-CH", "en");

    private final OutboxRepository outbox;
    private final Clock clock;

    MessagingService(OutboxRepository outbox, Clock clock) {
        this.outbox = outbox;
        this.clock = clock;
    }

    void accept(MessageRequest request) {
        validate(request);
        outbox.enqueue(request, clock.instant());
    }

    List<OutboxMessage> failedMessages() {
        return outbox.failed();
    }

    void retryMessage(UUID id) {
        outbox.retry(id, clock.instant());
    }

    void scrubMessages(String correlationKey) {
        if (correlationKey == null || correlationKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correlation key is required");
        }
        outbox.scrub(correlationKey, clock.instant());
    }

    private void validate(MessageRequest request) {
        if (request.id() == null
                || !MESSAGE_TYPES.contains(request.messageType())
                || request.recipientEmail() == null
                || request.recipientEmail().isBlank()
                || !LOCALES.contains(request.locale())
                || request.payload() == null
                || !request.payload().isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid message request");
        }
    }
}
