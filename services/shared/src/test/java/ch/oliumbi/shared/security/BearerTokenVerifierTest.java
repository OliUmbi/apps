package ch.oliumbi.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BearerTokenVerifierTest {

    private final BearerTokenVerifier verifier = new BearerTokenVerifier("secret-token");

    @Test
    void rejectsABlankExpectedToken() {
        assertThatThrownBy(() -> new BearerTokenVerifier(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new BearerTokenVerifier("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void acceptsTheConfiguredTokenRegardlessOfSchemeCasing() {
        assertThat(verifier.valid("Bearer secret-token")).isTrue();
        assertThat(verifier.valid("bearer secret-token")).isTrue();
    }

    @Test
    void rejectsAnythingElse() {
        assertThat(verifier.valid(null)).isFalse();
        assertThat(verifier.valid("secret-token")).isFalse();
        assertThat(verifier.valid("Basic secret-token")).isFalse();
        assertThat(verifier.valid("Bearer wrong-token")).isFalse();
        assertThat(verifier.valid("Bearer ")).isFalse();
        assertThat(verifier.valid("Bearer secret-token-extra")).isFalse();
    }

    @Test
    void requireValidThrowsUnauthorized() {
        verifier.requireValid("Bearer secret-token");

        assertThatThrownBy(() -> verifier.requireValid("Bearer wrong-token"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }
}
