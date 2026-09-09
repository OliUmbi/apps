package ch.oliumbi.identity.services;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class TokenService {

    private static final String HASHING_ALGORITHM = "SHA-256";
    private final SecureRandom random = new SecureRandom();

    public String generate() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    public String hash(String token) {
        try {
            var digest = MessageDigest.getInstance(HASHING_ALGORITHM);

            var bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(HASHING_ALGORITHM + " is unavailable", e);
        }
    }
}
