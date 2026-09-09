package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.repositories.MessageRepository;
import ch.oliumbi.messaging.repositories.QueuedMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageIntakeService {

    private final QueuedMessageRepository queuedMessageRepository;
    private final MessageRepository messageRepository;
    private final MessageCreationService messageCreationService;

    public MessageIntakeService(QueuedMessageRepository queuedMessageRepository, MessageRepository messageRepository,
                                MessageCreationService messageCreationService) {
        this.queuedMessageRepository = queuedMessageRepository;
        this.messageRepository = messageRepository;
        this.messageCreationService = messageCreationService;
    }

    // todo i like this structure quite clear
    @Transactional
    public boolean acceptNext() {
        var queued = queuedMessageRepository.findNext();
        if (queued.isEmpty()) {
            return false;
        }

        var request = queued.get();
        if (!messageRepository.existsById(request.getId())) {
            messageCreationService.create(request);
        }

        queuedMessageRepository.delete(request);
        return true;
    }
}
