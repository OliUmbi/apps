package ch.oliumbi.messaging.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfiguration {

    @Value("${messaging.authorization-token}")
    private String authorizationToken;

    @Bean
    public String authorizationToken() {
        return authorizationToken;
    }
}
