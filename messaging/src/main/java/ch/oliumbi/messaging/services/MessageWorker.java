package ch.oliumbi.messaging.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(name = "messaging.worker-enabled", havingValue = "true", matchIfMissing = true)
public class MessageWorker {

    private final MessageIntakeService messageIntakeService;
    private final MessageProcessingService messageProcessingService;

    public MessageWorker(MessageIntakeService messageIntakeService, MessageProcessingService messageProcessingService) {
        this.messageIntakeService = messageIntakeService;
        this.messageProcessingService = messageProcessingService;
    }

    // todo some magic values but overall acceptable
    @Scheduled(fixedDelayString = "${messaging.poll-delay-ms:1000}")
    public void accept() {
        try {
            for (int accepted = 0; accepted < 20; accepted++) {
                if (!messageIntakeService.acceptNext()) {
                    return;
                }
            }
        } catch (RuntimeException exception) {
            log.error("Message intake unavailable ({}); requests remain in the queue",
                    exception.getClass().getSimpleName());
        }
    }

    @Scheduled(fixedDelayString = "${messaging.poll-delay-ms:1000}")
    public void deliver() {
        try {
            for (int delivered = 0; delivered < 20; delivered++) {
                if (!messageProcessingService.processNext()) {
                    return;
                }
            }
        } catch (RuntimeException exception) {
            log.error("Message processing interrupted ({}); unfinished claims recover after lease expiry",
                    exception.getClass().getSimpleName());
        }
    }
}
