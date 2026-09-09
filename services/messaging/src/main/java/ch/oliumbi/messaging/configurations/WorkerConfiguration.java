package ch.oliumbi.messaging.configurations;

import ch.oliumbi.messaging.domain.DeliveryStateMachine;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

// todo please implement all configurations in this style if possible
// todo create a class for the Properties and one for the Configuration where it is injectable as a bean like described here https://www.baeldung.com/spring-enable-config-properties
@Configuration
@EnableConfigurationProperties(WorkerConfiguration.Settings.class)
public class WorkerConfiguration {

    @Validated
    @ConfigurationProperties("messaging.worker")
    public record Settings(
            @Min(1) int batchSize,
            @NotNull Duration leaseDuration,
            @NotNull List<Duration> retryDelays) {
    }

    @Bean
    public DeliveryStateMachine deliveryStateMachine(Settings settings) {
        return new DeliveryStateMachine(settings.leaseDuration(), settings.retryDelays());
    }
}
