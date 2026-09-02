package ch.oliumbi.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
class IdentityService implements CommandLineRunner {
    private final JdbcClient jdbc;
    private final PasswordEncoder passwords;
    private final SecureRandom random = new SecureRandom();
    private final String bootstrapUsername;
    private final String bootstrapPassword;
    private final int sessionDays;

    IdentityService(
            JdbcClient jdbc,
            PasswordEncoder passwords,
            @Value("${identity.bootstrap-username:}") String bootstrapUsername,
            @Value("${identity.bootstrap-password:}") String bootstrapPassword,
            @Value("${identity.session-days:7}") int sessionDays) {
        this.jdbc = jdbc;
        this.passwords = passwords;
        this.bootstrapUsername = bootstrapUsername;
        this.bootstrapPassword = bootstrapPassword;
        this.sessionDays = sessionDays;
    }

    @Override
    public void run(String... args) {
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) return;
        long count = jdbc.sql("select count(*) from identity.account").query(Long.class).single();
        if (count == 0) {
            jdbc.sql("""
                            insert into identity.account (username, password_hash, display_name)
                            values (:username, :passwordHash, :displayName)
                            """)
                    .param("username", bootstrapUsername.trim().toLowerCase())
                    .param("passwordHash", passwords.encode(bootstrapPassword))
                    .param("displayName", bootstrapUsername.trim())
                    .update();
        }
    }

    SessionCreated authenticate(String username, String password) {
        var account = jdbc.sql("""
                        select id, username, password_hash, display_name
                        from identity.account where username = :username and enabled = true
                        """)
                .param("username", username.trim().toLowerCase())
                .query((rs, row) -> new Account(
                        rs.getObject("id", UUID.class), rs.getString("username"),
                        rs.getString("password_hash"), rs.getString("display_name")))
                .optional()
                .orElse(null);
        if (account == null || !passwords.matches(password, account.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = randomToken();
        Instant expiresAt = Instant.now().plus(sessionDays, ChronoUnit.DAYS);
        jdbc.sql("""
                        insert into identity.session (token_hash, account_id, expires_at)
                        values (:tokenHash, :accountId, :expiresAt)
                        """)
                .param("tokenHash", hash(token)).param("accountId", account.id())
                .param("expiresAt", Timestamp.from(expiresAt)).update();
        return new SessionCreated(token, expiresAt, new Actor(account.id(), account.username(), account.displayName()));
    }

    Actor validate(String token) {
        return jdbc.sql("""
                        select a.id, a.username, a.display_name
                        from identity.session s join identity.account a on a.id = s.account_id
                        where s.token_hash = :tokenHash and s.revoked_at is null
                          and s.expires_at > now() and a.enabled = true
                        """)
                .param("tokenHash", hash(token))
                .query((rs, row) -> new Actor(rs.getObject("id", UUID.class), rs.getString("username"), rs.getString("display_name")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session"));
    }

    void revoke(String token) {
        jdbc.sql("update identity.session set revoked_at = now() where token_hash = :tokenHash")
                .param("tokenHash", hash(token)).update();
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

    private record Account(UUID id, String username, String passwordHash, String displayName) {
    }

    record Actor(UUID id, String username, String displayName) {
    }

    record SessionCreated(String token, Instant expiresAt, Actor actor) {
    }
}
