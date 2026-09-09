package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.*;
import ch.oliumbi.messaging.domain.MessageStatus;
import ch.oliumbi.messaging.repositories.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messages;
    private final MessageAttemptRepository attempts;

    public MessageService(MessageRepository messages, MessageAttemptRepository attempts) {
        this.messages = messages;
        this.attempts = attempts;
    }

    public Page<MessageResponse> history(String status, Pageable pageable) {
        if (status == null) return messages.findAll(pageable).map(MessageResponse::fromMessage);
        MessageStatus requestedStatus;
        try {
            requestedStatus = MessageStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return Page.empty(pageable);
        }
        return messages.findByStatus(requestedStatus, pageable).map(MessageResponse::fromMessage);
    }

    public MessageDetailResponse get(UUID id) {
        var message = messages.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var history = attempts.findByMessageIdOrderByAttemptNumber(id).stream()
                .map(MessageAttemptResponse::fromAttempt).toList();
        return new MessageDetailResponse(MessageResponse.fromMessage(message), history);
    }
}
