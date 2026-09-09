package ch.oliumbi.messaging.services.intake;

import ch.oliumbi.messaging.data.entites.Message;
import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.repositories.MessageRepository;
import ch.oliumbi.messaging.repositories.QueuedMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;

@Service
public class MessageIntakeService {

    private final QueuedMessageRepository queue;
    private final MessageRepository messages;
    private final Clock clock;

    public MessageIntakeService(QueuedMessageRepository queue, MessageRepository messages, Clock clock) {
        this.queue = queue;
        this.messages = messages;
        this.clock = clock;
    }

    @Transactional
    public boolean acceptNext() {
        var queued = queue.findNext();
        if (queued.isEmpty()) {
            return false;
        }

        var request = queued.get();
        if (!messages.existsByQueueId(request.getId())) {
            messages.saveAndFlush(new Message(request, new DeliveryState.Pending(0, clock.instant())));
        }

        queue.delete(request);
        return true;
    }
}
