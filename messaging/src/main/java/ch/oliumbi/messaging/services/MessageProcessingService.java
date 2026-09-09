package ch.oliumbi.messaging.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MessageProcessingService {

    private final MessageClaimService messageClaimService;
    private final MessageDispatchService messageDispatchService;
    private final MessageCompletionService messageCompletionService;

    public MessageProcessingService(MessageClaimService messageClaimService, MessageDispatchService messageDispatchService,
                                    MessageCompletionService messageCompletionService) {
        this.messageClaimService = messageClaimService;
        this.messageDispatchService = messageDispatchService;
        this.messageCompletionService = messageCompletionService;
    }

    // todo this looks quite messy with overlapping responsibilities
    public boolean processNext() {
        var claim = messageClaimService.claim();
        if (claim.isEmpty()) {
            return false;
        }
        // SMTP runs between the claim and completion transactions.
        var failure = messageDispatchService.send(claim.get());
        try {
            messageCompletionService.complete(claim.get(), failure);
        } catch (RuntimeException exception) {
            log.error("Could not record message {} attempt {}; its lease will recover",
                    claim.get().id(), claim.get().attemptNumber());
            throw exception;
        }
        return true;
    }
}
