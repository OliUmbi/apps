package ch.oliumbi.shared.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class BearerTokenVerifier {

    private static final String BEARER_PREFIX = "Bearer ";
    private final byte[] expectedToken;

    public BearerTokenVerifier(String expectedToken) {
        if (expectedToken == null || expectedToken.isBlank()) {
            throw new IllegalArgumentException("The authorization token must not be blank.");
        }
        this.expectedToken = expectedToken.getBytes(StandardCharsets.UTF_8);
    }

    public boolean valid(String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            return false;
        }
        var providedToken = authorization.substring(BEARER_PREFIX.length()).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expectedToken, providedToken);
    }
}