package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.entites.Message;
import ch.oliumbi.messaging.data.entites.MessageAttempt;
import ch.oliumbi.messaging.data.responses.MessageFailure;
import ch.oliumbi.messaging.repositories.MessageAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@Transactional(propagation = Propagation.MANDATORY)
public class MessageAttemptService {

    private final MessageAttemptRepository messageAttemptRepository;

    public MessageAttemptService(MessageAttemptRepository messageAttemptRepository) {
        this.messageAttemptRepository = messageAttemptRepository;
    }

    public void start(Message message, Instant now) {
        messageAttemptRepository.save(new MessageAttempt(message.getId(), message.getAttemptCount(), now));
    }

    public void finish(Message message, String outcome, Optional<MessageFailure> failure, Instant now) {
        var attempt = messageAttemptRepository
                .findByMessageIdAndAttemptNumber(message.getId(), message.getAttemptCount()).orElseThrow();

        // todo maybe fold the failure into the message/detail
        attempt.setOutcome(outcome);
        attempt.setFailureCode(failure.map(MessageFailure::code).orElse(null));
        attempt.setMessage(failure.map(MessageFailure::message).orElse(null));
        attempt.setFinishedAt(now);
    }
}
