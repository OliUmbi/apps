package ch.oliumbi.assets.configurations;

import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
@EnableConfigurationProperties({AssetsProperties.class, ImageProperties.class})
public class AssetsConfiguration {
    @Bean
    public BearerTokenVerifier bearerTokenVerifier(AssetsProperties properties) {
        return new BearerTokenVerifier(properties.authorizationToken());
    }

    @Bean
    public TransactionTemplate transactionTemplate(PlatformTransactionManager transactionManager) {
        return new TransactionTemplate(transactionManager);
    }
}
