package ch.oliumbi.identity;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
class IdentityRepository {
    private final JdbcClient jdbc;

    IdentityRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    boolean hasAccounts() {
        return jdbc.sql("select count(*) from identity.account").query(Long.class).single() > 0;
    }

    void createAccount(UUID id, String username, String passwordHash, String displayName, Instant now) {
        jdbc.sql("""
                        insert into identity.account (
                            id, username, password_hash, display_name, enabled, created_at, updated_at
                        ) values (
                            :id, :username, :passwordHash, :displayName, true, :createdAt, :updatedAt
                        )
                        """)
                .param("id", id)
                .param("username", username)
                .param("passwordHash", passwordHash)
                .param("displayName", displayName)
                .param("createdAt", Timestamp.from(now))
                .param("updatedAt", Timestamp.from(now))
                .update();
    }

    Optional<Account> findEnabledAccount(String username) {
        return jdbc.sql("""
                        select id, username, password_hash, display_name
                        from identity.account where username = :username and enabled = true
                        """)
                .param("username", username)
                .query((rs, row) -> new Account(
                        rs.getObject("id", UUID.class), rs.getString("username"),
                        rs.getString("password_hash"), rs.getString("display_name")))
                .optional();
    }

    void createSession(UUID id, String tokenHash, UUID accountId, Instant now, Instant expiresAt) {
        jdbc.sql("""
                        insert into identity.session (
                            id, token_hash, account_id, created_at, expires_at, last_seen_at
                        ) values (
                            :id, :tokenHash, :accountId, :createdAt, :expiresAt, :lastSeenAt
                        )
                        """)
                .param("id", id)
                .param("tokenHash", tokenHash)
                .param("accountId", accountId)
                .param("createdAt", Timestamp.from(now))
                .param("expiresAt", Timestamp.from(expiresAt))
                .param("lastSeenAt", Timestamp.from(now))
                .update();
    }

    Optional<IdentityService.Actor> findActorByValidSession(String tokenHash, Instant now) {
        return jdbc.sql("""
                        select a.id, a.username, a.display_name
                        from identity.session s join identity.account a on a.id = s.account_id
                        where s.token_hash = :tokenHash and s.revoked_at is null
                          and s.expires_at > :now and a.enabled = true
                        """)
                .param("tokenHash", tokenHash)
                .param("now", Timestamp.from(now))
                .query((rs, row) -> new IdentityService.Actor(
                        rs.getObject("id", UUID.class),
                        rs.getString("username"),
                        rs.getString("display_name")))
                .optional();
    }

    void revokeSession(String tokenHash, Instant now) {
        jdbc.sql("update identity.session set revoked_at = :revokedAt where token_hash = :tokenHash")
                .param("tokenHash", tokenHash)
                .param("revokedAt", Timestamp.from(now))
                .update();
    }

    record Account(UUID id, String username, String passwordHash, String displayName) {
    }
}
