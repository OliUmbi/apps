package ch.oliumbi.messaging.services.processing;

import ch.oliumbi.messaging.configurations.WorkerProperties;
import ch.oliumbi.messaging.services.delivery.EmailDelivery;
import ch.oliumbi.messaging.services.intake.MessageIntakeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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

    @Scheduled(fixedDelayString = "${messaging.worker.poll-delay-ms}")
    public void accept() {
        try {
            for (int count = 0; count < batchSize; count++) {
                if (!intake.acceptNext()) {
                    return;
                }
            }
        } catch (RuntimeException exception) {
            log.error("Intake interrupted ({}); uncommitted requests remain queued", exception.getClass().getSimpleName());
        }
    }

    @Scheduled(fixedDelayString = "${messaging.worker.poll-delay-ms}")
    public void deliver() {
        try {
            for (int count = 0; count < batchSize; count++) {
                switch (store.claim()) {
                    case DeliveryStore.ClaimResult.Empty ignored -> { return; }
                    case DeliveryStore.ClaimResult.Closed ignored -> { /* Continue after exhausting a stale message. */ }
                    case DeliveryStore.ClaimResult.Claimed claimed -> {
                        // Claim commits before SMTP; completion uses a separate transaction.
                        var result = delivery.send(claimed.claim());
                        store.complete(claimed.claim(), result);
                    }
                }
            }
        } catch (RuntimeException exception) {
            log.error("Delivery processing interrupted ({}); leases recover unfinished work", exception.getClass().getSimpleName());
        }
    }
}
