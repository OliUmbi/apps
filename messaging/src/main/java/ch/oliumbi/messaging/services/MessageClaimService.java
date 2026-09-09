package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageClaim;
import ch.oliumbi.messaging.repositories.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Optional;

@Service
public class MessageClaimService {

    private final MessageRepository messageRepository;
    private final MessageRetryService messageRetryService;
    private final MessageRecoveryService messageRecoveryService;
    private final MessageAttemptService messageAttemptService;
    private final Clock clock;

    public MessageClaimService(MessageRepository messageRepository, MessageRetryService messageRetryService,
                               MessageRecoveryService messageRecoveryService, MessageAttemptService messageAttemptService,
                               Clock clock) {
        this.messageRepository = messageRepository;
        this.messageRetryService = messageRetryService;
        this.messageRecoveryService = messageRecoveryService;
        this.messageAttemptService = messageAttemptService;
        this.clock = clock;
    }

    @Transactional
    public Optional<MessageClaim> claim() {
        var now = clock.instant();

        var candidate = messageRepository.findNext(now, now.minus(messageRetryService.leaseDuration()));
        if (candidate.isEmpty()) {
            return Optional.empty();
        }

        var message = candidate.get();
        if (!messageRecoveryService.prepare(message, now)) {
            return Optional.empty();
        }

        message.setAttemptCount(message.getAttemptCount() + 1);
        message.setStatus("processing");
        message.setLockedAt(now);

        messageAttemptService.start(message, now);

        return Optional.of(MessageClaim.fromMessage(message));
    }
}
