package ch.oliumbi.messaging.configurations;

import ch.oliumbi.messaging.domain.DeliveryStateMachine;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(WorkerProperties.class)
public class WorkerConfiguration {

    @Bean
    public DeliveryStateMachine deliveryStateMachine(WorkerProperties properties) {
        return new DeliveryStateMachine(properties.leaseDuration(), properties.retryDelays());
    }
}