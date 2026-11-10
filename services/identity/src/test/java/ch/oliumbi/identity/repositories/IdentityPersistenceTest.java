package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.entities.AccountSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The narrow PostgreSQL suite for identity: the native permission upsert and
 * the session JPQL queries, with {@code ddl-auto=validate} proving the entity
 * mapping against the migrated schema at context startup.
 *
 * Disabled without {@code STUDIO_TEST_ADMIN_URL}; CI migrates a database and
 * sets it (see documentation/development/verification.md).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "STUDIO_TEST_ADMIN_URL", matches = ".+")
class IdentityPersistenceTest {

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        TestDatabase.register(registry);
    }

    @Autowired
    private AccountRepository accounts;

    @Autowired
    private AccountPermissionRepository permissions;

    @Autowired
    private AccountSessionRepository sessions;

    @Autowired
    private TestEntityManager entityManager;

    private final Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Test
    void grantingAPermissionIsIdempotentAndPersistsOneRow() {
        var account = account(true);

        assertThat(permissions.grantIfAbsent(account.getId(), "studio.admin", now))
                .isEqualTo(1);
        assertThat(permissions.grantIfAbsent(account.getId(), "studio.admin", now))
                .isEqualTo(0);

        entityManager.clear();
        assertThat(accounts.findDetailedById(account.getId())).get()
                .satisfies(detailed -> assertThat(detailed.getPermissions()).singleElement()
                        .satisfies(permission -> assertThat(permission.getId().getPermission())
                                .isEqualTo("studio.admin")));
    }

    @Test
    void validSessionRequiresAnEnabledAccountAndALiveToken() {
        var active = account(true);
        sessions.save(session(active, "live", now.plus(1, ChronoUnit.HOURS)));
        sessions.save(session(active, "expired", now.minus(1, ChronoUnit.HOURS)));
        sessions.save(session(active, "revoked", now.plus(1, ChronoUnit.HOURS)));
        entityManager.flush();
        sessions.revokeByTokenHash("revoked", now);
        entityManager.clear();

        assertThat(sessions.findValidSession("live", now)).isPresent();
        assertThat(sessions.findValidSession("expired", now)).isEmpty();
        assertThat(sessions.findValidSession("revoked", now)).isEmpty();

        var disabled = account(false);
        sessions.save(session(disabled, "disabled", now.plus(1, ChronoUnit.HOURS)));
        entityManager.flush();
        entityManager.clear();
        assertThat(sessions.findValidSession("disabled", now)).isEmpty();
    }

    @Test
    void revokingAnAccountClosesEverySessionAndPurgeRemovesExpiredOnes() {
        var account = account(true);
        sessions.save(session(account, "live", now.plus(1, ChronoUnit.HOURS)));
        sessions.save(session(account, "expired", now.minus(1, ChronoUnit.HOURS)));
        entityManager.flush();

        sessions.revokeByAccountId(account.getId(), now);
        entityManager.clear();

        assertThat(sessions.findValidSession("live", now)).isEmpty();
        assertThat(sessions.deleteByExpiredBefore(now)).isEqualTo(1);
        assertThat(sessions.count()).isEqualTo(1);
    }

    private Account account(boolean enabled) {
        var suffix = Long.toHexString(System.nanoTime());
        return accounts.saveAndFlush(new Account("review-" + suffix,
                "review-" + suffix + "@example.com", "password-hash", enabled));
    }

    private static AccountSession session(Account account, String tokenHash, Instant expiresAt) {
        return new AccountSession(account, tokenHash, expiresAt, expiresAt);
    }
}
