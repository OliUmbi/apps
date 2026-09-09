package ch.oliumbi.assets.configurations;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("assets.image")
public record ImageProperties(
        @Min(1) long maxBytes,
        @Min(1) long maxPixels,
        @Min(1) int maxSide,
        @Min(1) int masterMaxSide,
        @Min(1) int concurrency) {
}
