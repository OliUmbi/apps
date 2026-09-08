package ch.oliumbi.identity.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class InternalAuthorizationService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final byte[] expectedToken;

    public InternalAuthorizationService(String authorizationToken) {
        this.expectedToken = authorizationToken.getBytes(StandardCharsets.UTF_8);
    }

    public boolean valid(String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            return false;
        }

        byte[] providedToken = authorization
                .substring(BEARER_PREFIX.length())
                .getBytes(StandardCharsets.UTF_8);

        return MessageDigest.isEqual(expectedToken, providedToken);
    }

    public void requireValid(String authorization) {
        if (!valid(authorization)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }
}
