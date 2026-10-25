package ch.oliumbi.messaging.configurations;

import ch.oliumbi.messaging.domain.DeliveryStateMachine;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableConfigurationProperties(WorkerProperties.class)
public class WorkerConfiguration {

    @Bean
    public DeliveryStateMachine deliveryStateMachine(WorkerProperties properties) {
        return new DeliveryStateMachine(properties.leaseDuration(), properties.retryDelays());
    }

    /**
     * One thread per loop so a full delivery batch cannot starve intake.
     */
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        var scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("messaging-worker-");
        return scheduler;
    }
}
