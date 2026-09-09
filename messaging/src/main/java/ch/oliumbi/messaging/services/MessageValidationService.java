package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.entites.QueuedMessage;
import ch.oliumbi.messaging.data.requests.MessageCreateRequest;
import ch.oliumbi.messaging.data.responses.MessageFailure;
import jakarta.validation.Validator;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageValidationService {

    private final Validator validator;

    public MessageValidationService(Validator validator) {
        this.validator = validator;
    }

    // todo seems a bit messy to validate the request but is not the worst
    public Optional<MessageFailure> validate(QueuedMessage message) {
        var request = new MessageCreateRequest(message.getSite(), message.getType(),
                message.getSender(), message.getRecipient(), message.getSubject(), message.getText(), message.getHtml());

        var violations = validator.validate(request);
        if (violations.isEmpty()) {
            return Optional.empty();
        }

        var fields = violations.stream()
                .map(violation -> violation.getPropertyPath().toString())
                .distinct()
                .sorted()
                .collect(Collectors.joining(", "));

        return Optional.of(new MessageFailure("INVALID_REQUEST", "Invalid fields: " + fields, false));
    }
}
