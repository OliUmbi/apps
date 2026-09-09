package ch.oliumbi.identity.configurations;

import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(IdentityProperties.class)
public class IdentityConfiguration {

    @Bean
    public BearerTokenVerifier bearerTokenVerifier(IdentityProperties properties) {
        return new BearerTokenVerifier(properties.authorizationToken());
    }
}