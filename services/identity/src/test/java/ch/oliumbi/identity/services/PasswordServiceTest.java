package ch.oliumbi.identity.services;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordServiceTest {

    private final PasswordService passwordService = new PasswordService(new BCryptPasswordEncoder());

    @Test
    void acceptsPasswordsThatMeetThePolicy() {
        assertThat(passwordService.meetsRequirements("CorrectHorse1")).isTrue();
        assertThat(passwordService.meetsRequirements("12345678aB")).isTrue();
    }

    @Test
    void rejectsWeakOrUnsupportedPasswords() {
        assertThat(passwordService.meetsRequirements(null)).isFalse();
        assertThat(passwordService.meetsRequirements("   ")).isFalse();
        assertThat(passwordService.meetsRequirements("Short1a")).isFalse();
        assertThat(passwordService.meetsRequirements("alllowercase1")).isFalse();
        assertThat(passwordService.meetsRequirements("ALLUPPERCASE1")).isFalse();
        assertThat(passwordService.meetsRequirements("NoDigitsHere")).isFalse();
        // bcrypt only reads the first 72 UTF-8 bytes
        assertThat(passwordService.meetsRequirements("Aa1" + "x".repeat(70))).isFalse();
    }

    @Test
    void countsCharactersNotUtf16Units() {
        // seven emoji plus three ASCII characters are ten characters
        assertThat(passwordService.meetsRequirements("\uD83D\uDE00".repeat(7) + "Aa1")).isTrue();
        assertThat(passwordService.meetsRequirements("\uD83D\uDE00".repeat(6) + "Aa1")).isFalse();
    }

    @Test
    void encodeRejectsPasswordsOutsideThePolicy() {
        assertThatThrownBy(() -> passwordService.encode("too-short"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void encodeAndMatchesRoundTrip() {
        var hash = passwordService.encode("CorrectHorse1");

        assertThat(hash).isNotEqualTo("CorrectHorse1");
        assertThat(passwordService.matches("CorrectHorse1", hash)).isTrue();
        assertThat(passwordService.matches("WrongHorse1", hash)).isFalse();
        assertThat(passwordService.matches(null, hash)).isFalse();
    }
}
