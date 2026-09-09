package ch.oliumbi.identity.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

@Service
public class PasswordService {

    private static final int MIN_PASSWORD_CHARACTERS = 10;
    private static final int MAX_BCRYPT_BYTES = 72;

    private final PasswordEncoder passwordEncoder;

    public PasswordService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public String encode(String password) {
        if (!meetsRequirements(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must have at least 10 characters, an uppercase letter, a lowercase letter "
                            + "and a number, and must not exceed 72 UTF-8 bytes");
        }
        return passwordEncoder.encode(password);
    }

    public boolean meetsRequirements(String password) {
        return isSupportedByBcrypt(password)
                && password.codePointCount(0, password.length()) >= MIN_PASSWORD_CHARACTERS
                && password.codePoints().anyMatch(Character::isUpperCase)
                && password.codePoints().anyMatch(Character::isLowerCase)
                && password.codePoints().anyMatch(Character::isDigit);
    }

    public boolean matches(String password, String passwordHash) {
        return isSupportedByBcrypt(password) && passwordEncoder.matches(password, passwordHash);
    }


    private boolean isSupportedByBcrypt(String password) {
        return password != null
                && !password.isBlank()
                && password.getBytes(StandardCharsets.UTF_8).length <= MAX_BCRYPT_BYTES;
    }
}
