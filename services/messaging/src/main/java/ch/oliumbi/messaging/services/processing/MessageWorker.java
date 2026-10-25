package ch.oliumbi.messaging.services.processing;

import ch.oliumbi.messaging.configurations.WorkerProperties;
import ch.oliumbi.messaging.services.delivery.EmailDelivery;
import ch.oliumbi.messaging.services.intake.MessageIntakeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
public class MessageWorker {

    private final MessageIntakeService intake;
    private final DeliveryStore store;
    private final EmailDelivery delivery;
    private final int batchSize;

    public MessageWorker(MessageIntakeService intake, DeliveryStore store, EmailDelivery delivery,
                         WorkerProperties properties) {
        this.intake = intake;
        this.store = store;
        this.delivery = delivery;
        this.batchSize = properties.batchSize();
    }

    @Scheduled(fixedDelayString = "${messaging.worker.accept-poll-delay-ms}")
    public void accept() {
        var skipped = new HashSet<UUID>();
        for (int count = 0; count < batchSize; count++) {
            try {
                if (!intake.acceptNext(skipped)) {
                    return;
                }
            } catch (RuntimeException exception) {
                log.error("Intake request failed; continuing with the next queued row", exception);
            }
        }
    }

    @Scheduled(fixedDelayString = "${messaging.worker.deliver-poll-delay-ms}")
    public void deliver() {
        var skipped = new HashSet<UUID>();
        for (int count = 0; count < batchSize; count++) {
            DeliveryStore.ClaimResult result;
            try {
                result = store.claim(skipped);
            } catch (RuntimeException exception) {
                log.error("Claim failed; continuing with the next message", exception);
                continue;
            }
            switch (result) {
                case DeliveryStore.ClaimResult.Empty ignored -> { return; }
                case DeliveryStore.ClaimResult.Closed ignored -> { /* Continue after exhausting a stale message. */ }
                case DeliveryStore.ClaimResult.Deferred ignored -> { /* Continue; the recovered retry is scheduled with backoff. */ }
                case DeliveryStore.ClaimResult.Claimed claimed -> {
                    // Claim commits before SMTP; completion uses a separate transaction.
                    try {
                        var outcome = delivery.send(claimed.claim());
                        store.complete(claimed.claim(), outcome);
                    } catch (RuntimeException exception) {
                        skipped.add(claimed.claim().messageId());
                        log.error("Delivery of message {} failed; continuing with the next message",
                                claimed.claim().messageId(), exception);
                    }
                }
            }
        }
    }
}
