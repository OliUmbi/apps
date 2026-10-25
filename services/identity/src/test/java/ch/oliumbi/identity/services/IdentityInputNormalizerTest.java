package ch.oliumbi.identity.services;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IdentityInputNormalizerTest {

    private final IdentityInputNormalizer normalizer = new IdentityInputNormalizer();

    @Test
    void normalizesNamesAndEmails() {
        assertThat(normalizer.normalizeName("  Alice  ")).isEqualTo("alice");
        assertThat(normalizer.normalizeName("ALICE")).isEqualTo("alice");
        assertThat(normalizer.normalizeEmail(" Bob@Example.COM ")).isEqualTo("bob@example.com");
    }

    @Test
    void trimsPermissionsButKeepsTheirCasing() {
        assertThat(normalizer.normalizePermission(" site:admin ")).isEqualTo("site:admin");
    }

    @Test
    void rejectsMissingValues() {
        for (var missing : new String[]{null, "", "   "}) {
            assertThatThrownBy(() -> normalizer.normalizeName(missing))
                    .isInstanceOfSatisfying(ResponseStatusException.class, this::assertBadRequest);
            assertThatThrownBy(() -> normalizer.normalizeEmail(missing))
                    .isInstanceOfSatisfying(ResponseStatusException.class, this::assertBadRequest);
            assertThatThrownBy(() -> normalizer.normalizePermission(missing))
                    .isInstanceOfSatisfying(ResponseStatusException.class, this::assertBadRequest);
        }
    }

    private void assertBadRequest(ResponseStatusException exception) {
        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
