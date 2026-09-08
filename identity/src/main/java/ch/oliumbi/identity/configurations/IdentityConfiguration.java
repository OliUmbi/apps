package ch.oliumbi.identity.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IdentityConfiguration {

    @Value("${identity.authorization-token}")
    private String authorizationToken;

    @Value("${identity.session-expiration-days}")
    private Integer sessionExpirationDays;

    @Bean
    public String authorizationToken() {
        return authorizationToken;
    }

    @Bean
    public Integer sessionExpirationDays() {
        return sessionExpirationDays;
    }
}
