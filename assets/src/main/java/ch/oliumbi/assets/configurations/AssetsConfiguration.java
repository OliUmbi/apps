package ch.oliumbi.assets.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AssetsConfiguration {

    @Value("${identity.authorization-token}")
    private String authorizationToken;

    @Bean
    public String authorizationToken() {
        return authorizationToken;
    }
}
