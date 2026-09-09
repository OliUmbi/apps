package ch.oliumbi.identity.configurations;

import ch.oliumbi.shared.configurations.ClockConfiguration;
import ch.oliumbi.shared.configurations.OpenApiConfiguration;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({ClockConfiguration.class, OpenApiConfiguration.class, ApiExceptionHandler.class})
public class SharedConfiguration {
}