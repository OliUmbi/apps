package ch.oliumbi.shared.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rejects a missing or invalid internal bearer before Spring resolves request
 * arguments, so an unauthenticated malformed body gets 401 rather than 400.
 */
public final class BearerAuthorizationInterceptor implements HandlerInterceptor {

    private final BearerTokenVerifier authorization;

    public BearerAuthorizationInterceptor(BearerTokenVerifier authorization) {
        this.authorization = authorization;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        authorization.requireValid(request.getHeader(HttpHeaders.AUTHORIZATION));
        return true;
    }
}
