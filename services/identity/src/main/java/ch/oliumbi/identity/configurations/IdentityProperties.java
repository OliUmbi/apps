package ch.oliumbi.identity.configurations;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("identity")
public record IdentityProperties(
        @NotBlank String authorizationToken,
        @Min(1) int sessionExpirationDays) {
}