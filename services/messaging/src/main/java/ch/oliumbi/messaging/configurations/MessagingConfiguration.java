package ch.oliumbi.messaging.configurations;

import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MessagingProperties.class)
public class MessagingConfiguration {

    @Bean
    public BearerTokenVerifier bearerTokenVerifier(MessagingProperties properties) {
        return new BearerTokenVerifier(properties.authorizationToken());
    }
}