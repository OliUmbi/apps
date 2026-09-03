package ch.oliumbi.messaging;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.temporal.ChronoUnit;

@Component
class OutboxWorker {
    private final OutboxRepository outbox;
    private final EmailDelivery delivery;
    private final Clock clock;

    OutboxWorker(OutboxRepository outbox, EmailDelivery delivery, Clock clock) {
        this.outbox = outbox;
        this.delivery = delivery;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${messaging.poll-delay-ms:1000}")
    void deliver() {
        for (int delivered = 0; delivered < 20; delivered++) {
            var now = clock.instant();
            var claimed = outbox.claimNext(now, now.minus(5, ChronoUnit.MINUTES));
            if (claimed.isEmpty()) return;
            var message = claimed.get();
            try {
                delivery.send(message);
                outbox.markSent(message, clock.instant());
            } catch (Exception exception) {
                outbox.markFailed(message, exception, clock.instant());
            }
        }
    }
}
