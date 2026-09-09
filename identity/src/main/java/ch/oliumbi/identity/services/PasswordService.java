package ch.oliumbi.identity.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

@Service
public class PasswordService {

    private final PasswordEncoder passwordEncoder;

    public PasswordService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // todo why not more than 72 UTF bytes?
    public String encode(String password) {
        if (!meetsRequirements(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must have at least 10 characters, an uppercase letter, a lowercase letter "
                            + "and a number, and must not exceed 72 UTF-8 bytes");
        }
        return passwordEncoder.encode(password);
    }

    public boolean meetsRequirements(String password) {
        return canEncode(password)
                && password.codePointCount(0, password.length()) >= 10
                && password.codePoints().anyMatch(Character::isUpperCase)
                && password.codePoints().anyMatch(Character::isLowerCase)
                && password.codePoints().anyMatch(Character::isDigit);
    }

    public boolean matches(String password, String passwordHash) {
        return canEncode(password) && passwordEncoder.matches(password, passwordHash);
    }

    // todo move 72 to a named constant and find better name for function seems a bit odd
    private boolean canEncode(String password) {
        return password != null && !password.isBlank()
                && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
