package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.entites.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@Transactional(propagation = Propagation.MANDATORY)
public class MessageRecoveryService {

    private final MessageAttemptService messageAttemptService;
    private final MessageFailureService messageFailureService;
    private final MessageRetryService messageRetryService;

    public MessageRecoveryService(MessageAttemptService messageAttemptService, MessageFailureService messageFailureService,
                                  MessageRetryService messageRetryService) {
        this.messageAttemptService = messageAttemptService;
        this.messageFailureService = messageFailureService;
        this.messageRetryService = messageRetryService;
    }

    // todo i like the explicit abandoned handling but i dislike the structure and overlap
    public boolean prepare(Message message, Instant now) {
        if ("processing".equals(message.getStatus())) {
            var failure = messageFailureService.abandoned();

            messageAttemptService.finish(message, "abandoned", Optional.of(failure), now);

            message.setFailureCode(failure.code());
            message.setFailureMessage(failure.message());

            log.warn("Message {} attempt {} abandoned", message.getId(), message.getAttemptCount());
        }

        if (messageRetryService.canRetry(message.getAttemptCount())) {
            return true;
        }

        message.setStatus("failed");
        message.setLockedAt(null);
        message.setFinishedAt(now);

        log.error("Message {} exhausted its delivery attempts", message.getId());

        return false;
    }
}
