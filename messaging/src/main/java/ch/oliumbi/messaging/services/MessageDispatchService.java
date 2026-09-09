package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageClaim;
import ch.oliumbi.messaging.data.responses.MessageFailure;
import org.springframework.stereotype.Service;

import java.util.Optional;

// todo this class doesnt even support different delivery systems. i think either implement it correctly or not at all
@Service
public class MessageDispatchService {

    private final MessageDelivery messageDelivery;
    private final MessageFailureService messageFailureService;

    public MessageDispatchService(MessageDelivery messageDelivery, MessageFailureService messageFailureService) {
        this.messageDelivery = messageDelivery;
        this.messageFailureService = messageFailureService;
    }

    public Optional<MessageFailure> send(MessageClaim claim) {
        try {
            messageDelivery.send(claim);
            return Optional.empty();
        } catch (Exception exception) {
            return Optional.of(messageFailureService.classify(exception));
        }
    }
}
