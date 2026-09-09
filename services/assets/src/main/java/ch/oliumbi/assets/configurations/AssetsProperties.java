package ch.oliumbi.assets.configurations;

import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.nio.file.Path;

@Validated
@ConfigurationProperties("assets")
public record AssetsProperties(
        @NotBlank String authorizationToken,
        @NotNull Path storageRoot,
        @Min(1) long documentMaxBytes,
        @Min(1) long cleanupGraceHours,
        @Min(1) long cleanupDelayMs) {
}
