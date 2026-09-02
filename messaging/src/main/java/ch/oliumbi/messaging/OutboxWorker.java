package ch.oliumbi.messaging;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
class OutboxWorker {
    private final OutboxRepository outbox;
    private final EmailDelivery delivery;

    OutboxWorker(OutboxRepository outbox, EmailDelivery delivery) {
        this.outbox = outbox;
        this.delivery = delivery;
    }

    @Scheduled(fixedDelayString = "${messaging.poll-delay-ms:1000}")
    void deliver() {
        for (int delivered = 0; delivered < 20; delivered++) {
            var claimed = outbox.claimNext();
            if (claimed.isEmpty()) return;
            var message = claimed.get();
            try {
                delivery.send(message);
                outbox.markSent(message);
            } catch (Exception exception) {
                outbox.markFailed(message, exception);
            }
        }
    }
}
