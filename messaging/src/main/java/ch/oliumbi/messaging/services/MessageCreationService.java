package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.entites.Message;
import ch.oliumbi.messaging.data.entites.QueuedMessage;
import ch.oliumbi.messaging.repositories.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;

@Slf4j
@Service
@Transactional(propagation = Propagation.MANDATORY)
public class MessageCreationService {

    private final MessageRepository messageRepository;
    private final MessageValidationService messageValidationService;
    private final Clock clock;

    public MessageCreationService(MessageRepository messageRepository, MessageValidationService messageValidationService,
                                  Clock clock) {
        this.messageRepository = messageRepository;
        this.messageValidationService = messageValidationService;
        this.clock = clock;
    }

    public void create(QueuedMessage request) {
        var now = clock.instant();
        var failure = messageValidationService.validate(request);
        var status = failure.isPresent() ? "failed" : "pending";
        // todo should probably be moved into the constructor where request is passed in
        var message = new Message(request.getId(), request.getSite(), request.getType(), request.getSender(),
                request.getRecipient(), request.getSubject(), request.getText(), request.getHtml(),
                status, 0, now, request.getCreatedAt());

        failure.ifPresent(reason -> {
            message.setFailureCode(reason.code());
            message.setFailureMessage(reason.message());
            message.setFinishedAt(now);
            log.warn("Message {} rejected: {}", message.getId(), reason.code());
        });

        messageRepository.saveAndFlush(message);
    }
}
