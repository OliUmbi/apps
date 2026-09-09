package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageClaim;
import ch.oliumbi.messaging.data.responses.MessageFailure;
import ch.oliumbi.messaging.repositories.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Optional;

@Slf4j
@Service
public class MessageCompletionService {

    private final MessageRepository messageRepository;
    private final MessageAttemptService messageAttemptService;
    private final MessageRetryService messageRetryService;
    private final Clock clock;

    public MessageCompletionService(MessageRepository messageRepository, MessageAttemptService messageAttemptService,
                                    MessageRetryService messageRetryService, Clock clock) {
        this.messageRepository = messageRepository;
        this.messageAttemptService = messageAttemptService;
        this.messageRetryService = messageRetryService;
        this.clock = clock;
    }

    @Transactional
    public void complete(MessageClaim claim, Optional<MessageFailure> failure) {
        var message = messageRepository.findLockedById(claim.id()).orElseThrow();

        if (!"processing".equals(message.getStatus()) || message.getAttemptCount() != claim.attemptNumber()) {
            log.warn("Ignored stale completion for message {} attempt {}", claim.id(), claim.attemptNumber());
            return;
        }

        var now = clock.instant();
        boolean retry = failure.filter(MessageFailure::retryable).isPresent() && messageRetryService.canRetry(claim.attemptNumber());
        var status = failure.isEmpty() ? "sent" : retry ? "pending" : "failed";

        message.setStatus(status);
        message.setLockedAt(null);
        message.setFinishedAt(retry ? null : now);
        message.setFailureCode(failure.map(MessageFailure::code).orElse(null));
        message.setFailureMessage(failure.map(MessageFailure::message).orElse(null));

        if (retry) {
            message.setAvailableAt(now.plus(messageRetryService.delay(claim.attemptNumber())));
        }

        messageAttemptService.finish(message, retry ? "retry" : status, failure, now);
        failure.ifPresent(reason -> log.warn("Message {} attempt {}: {} ({})",
                claim.id(), claim.attemptNumber(), reason.code(), status));
    }
}
