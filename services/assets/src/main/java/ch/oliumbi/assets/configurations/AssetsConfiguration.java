package ch.oliumbi.assets.configurations;

import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AssetsConfiguration {

    @Value("${identity.authorization-token}")
    private String authorizationToken;

    @Bean
    public BearerTokenVerifier bearerTokenVerifier() {
        return new BearerTokenVerifier(authorizationToken);
    }
}
