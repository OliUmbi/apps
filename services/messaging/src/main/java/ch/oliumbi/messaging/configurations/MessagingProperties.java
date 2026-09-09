package ch.oliumbi.messaging.configurations;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("messaging")
public record MessagingProperties(
        @NotBlank String authorizationToken) {
}