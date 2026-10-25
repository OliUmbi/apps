package ch.oliumbi.identity.services;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TokenServiceTest {

    private final TokenService tokenService = new TokenService();

    @Test
    void generatesUrlSafeTokensWith256BitsOfEntropy() {
        var token = tokenService.generate();

        assertThat(token).matches("[A-Za-z0-9_-]+");
        assertThat(java.util.Base64.getUrlDecoder().decode(token)).hasSize(32);
    }

    @Test
    void generatesDifferentTokens() {
        assertThat(tokenService.generate()).isNotEqualTo(tokenService.generate());
    }

    @Test
    void hashesToSha256Hex() {
        // known SHA-256 vector for "abc"
        assertThat(tokenService.hash("abc"))
                .isEqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        assertThat(tokenService.hash("abc")).isEqualTo(tokenService.hash("abc"));
    }
}
