package ch.oliumbi.messaging.configurations;

import ch.oliumbi.shared.security.BearerAuthorizationInterceptor;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class HttpConfiguration implements WebMvcConfigurer {

    private final BearerTokenVerifier authorization;

    public HttpConfiguration(BearerTokenVerifier authorization) {
        this.authorization = authorization;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new BearerAuthorizationInterceptor(authorization))
                .addPathPatterns("/message/**");
    }
}
