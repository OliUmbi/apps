package ch.oliumbi.messaging.configurations;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

@Validated
@ConfigurationProperties("messaging.worker")
public record WorkerProperties(
        @Min(1) int batchSize,
        @Min(1) long pollDelayMs,
        @NotNull Duration leaseDuration,
        @NotNull List<@NotNull Duration> retryDelays) {

    public WorkerProperties {
        if (retryDelays != null) {
            retryDelays = List.copyOf(retryDelays);
        }
    }

    @AssertTrue(message = "Lease duration and retry delays must be positive")
    public boolean isTimingValid() {
        return (leaseDuration == null || isPositive(leaseDuration))
                && (retryDelays == null || retryDelays.stream().allMatch(WorkerProperties::isPositive));
    }

    private static boolean isPositive(Duration duration) {
        return !duration.isNegative() && !duration.isZero();
    }
}