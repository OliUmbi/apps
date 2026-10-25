package ch.oliumbi.messaging.services.intake;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.repositories.MessageRepository;
import ch.oliumbi.messaging.repositories.QueuedMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public boolean acceptNext(Set<UUID> skipped) {
        var queued = queue.findNext(skipList(skipped));
        if (queued.isEmpty()) {
            return false;
        }

        var request = queued.get();
        try {
            if (!messages.existsByQueueId(request.getId())) {
                messages.saveAndFlush(new Message(request, new DeliveryState.Pending(0, clock.instant())));
            }

            queue.delete(request);
            return true;
        } catch (RuntimeException exception) {
            // The row is recorded in the run-scoped skip list before the transaction rolls back,
            // so one poisoned row cannot starve the rest of the batch; it retries on a later run.
            skipped.add(request.getId());
            throw exception;
        }
    }

    private static String skipList(Set<UUID> skipped) {
        return skipped.stream().map(UUID::toString).collect(Collectors.joining(","));
    }
}
