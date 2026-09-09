package ch.oliumbi.shared.configurations;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;

@Configuration
public class OpenApiConfiguration {

    private static final String SECURITY_NAME = "bearerAuth";
    private static final String SECURITY_SCHEME = "bearer";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_NAME))
                .components(
                        new Components()
                                .addSecuritySchemes(SECURITY_NAME,
                                        new SecurityScheme()
                                                .name(SECURITY_NAME)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme(SECURITY_SCHEME)
                                )
                );

    }

    @Bean
    public OperationCustomizer hideAuthorizationHeader() {
        return (operation, handlerMethod) -> {
            if (operation.getParameters() != null) {
                operation.getParameters()
                        .removeIf(parameter -> "header".equals(parameter.getIn()) && HttpHeaders.AUTHORIZATION.equalsIgnoreCase(parameter.getName()));
            }
            return operation;
        };
    }
}
