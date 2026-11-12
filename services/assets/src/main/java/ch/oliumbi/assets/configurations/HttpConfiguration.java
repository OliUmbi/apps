package ch.oliumbi.assets.configurations;

import ch.oliumbi.shared.security.BearerAuthorizationInterceptor;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
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
                .addPathPatterns("/internal/**");
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                response.setHeader("Cache-Control", "no-store");
                response.setHeader("X-Content-Type-Options", "nosniff");
                return true;
            }
        });
    }
}
