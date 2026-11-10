package ch.oliumbi.messaging.metrics;

import ch.oliumbi.messaging.domain.MessageStatus;
import ch.oliumbi.messaging.repositories.MessageRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Queue gauges for Prometheus. Each value is read from the database when
 * Prometheus scrapes, so the worker never carries a second copy of the truth.
 */
@Component
public class MessageMetrics {

    public MessageMetrics(MeterRegistry registry, MessageRepository messages) {
        for (MessageStatus status : MessageStatus.values()) {
            Gauge.builder("messaging_messages", messages, repository -> repository.countByStatus(status))
                .description("Delivery rows by lifecycle state")
                .tag("status", status.name().toLowerCase(Locale.ROOT))
                .register(registry);
        }
        Gauge.builder("messaging_oldest_pending_age_seconds", messages, MessageRepository::oldestPendingAgeSeconds)
            .description("Age of the oldest PENDING message, in seconds")
            .register(registry);
    }
}
