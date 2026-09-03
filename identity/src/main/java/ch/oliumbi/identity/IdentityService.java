package ch.oliumbi.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
class IdentityService implements CommandLineRunner {
    private final IdentityRepository repository;
    private final PasswordEncoder passwords;
    private final SecureRandom random = new SecureRandom();
    private final Clock clock;
    private final String bootstrapUsername;
    private final String bootstrapPassword;
    private final int sessionDays;

    IdentityService(
            IdentityRepository repository,
            PasswordEncoder passwords,
            Clock clock,
            @Value("${identity.bootstrap-username:}") String bootstrapUsername,
            @Value("${identity.bootstrap-password:}") String bootstrapPassword,
            @Value("${identity.session-days:7}") int sessionDays) {
        this.repository = repository;
        this.passwords = passwords;
        this.clock = clock;
        this.bootstrapUsername = bootstrapUsername;
        this.bootstrapPassword = bootstrapPassword;
        this.sessionDays = sessionDays;
    }

    @Override
    public void run(String... args) {
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) return;
        if (!repository.hasAccounts()) createBootstrapAccount();
    }

    SessionCreated authenticate(String username, String password) {
        var account = repository.findEnabledAccount(normalizeUsername(username)).orElse(null);
        if (account == null || !passwords.matches(password, account.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = randomToken();
        Instant now = clock.instant();
        Instant expiresAt = now.plus(sessionDays, ChronoUnit.DAYS);
        repository.createSession(UUID.randomUUID(), hash(token), account.id(), now, expiresAt);
        return new SessionCreated(token, expiresAt, new Actor(account.id(), account.username(), account.displayName()));
    }

    Actor validate(String token) {
        return repository.findActorByValidSession(hash(token), clock.instant())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
    }

    void revoke(String token) {
        repository.revokeSession(hash(token), clock.instant());
    }

    private void createBootstrapAccount() {
        String username = bootstrapUsername.trim();
        Instant now = clock.instant();
        repository.createAccount(
                UUID.randomUUID(), normalizeUsername(username), passwords.encode(bootstrapPassword), username, now);
    }

    private String normalizeUsername(String username) {
        return username.trim().toLowerCase();
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    record Actor(UUID id, String username, String displayName) {
    }

    record SessionCreated(String token, Instant expiresAt, Actor actor) {
    }
}
