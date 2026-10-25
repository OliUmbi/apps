package ch.oliumbi.identity.services;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.entities.AccountSession;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SessionPurgeServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    private final List<AccountSession> rows = new ArrayList<>();
    private final AccountSessionRepository sessions = mock(AccountSessionRepository.class);
    private final SessionPurgeService purgeService = new SessionPurgeService(
            sessions, Clock.fixed(NOW, ZoneOffset.UTC), new IdentityProperties("internal-token", 7, 30));

    @Test
    void purgeDeletesSessionsPastExpiryPlusRetentionAndKeepsTheRest() {
        // The mock applies the documented contract expiresAt < now - retention, so the
        // retention arithmetic of the job is what these rows exercise.
        when(sessions.deleteByExpiredBefore(any())).thenAnswer(invocation -> {
            Instant cutoff = invocation.getArgument(0);
            var before = rows.size();
            rows.removeIf(session -> session.getExpiresAt().isBefore(cutoff));
            return before - rows.size();
        });

        rows.add(session("past-retention", NOW.minus(31, ChronoUnit.DAYS)));
        rows.add(session("inside-retention", NOW.minus(29, ChronoUnit.DAYS)));
        rows.add(session("live", NOW.plus(7, ChronoUnit.DAYS)));

        purgeService.purge();

        assertThat(rows).extracting(AccountSession::getTokenHash)
                .containsExactlyInAnyOrder("inside-retention", "live");
    }

    private static AccountSession session(String tokenHash, Instant expiresAt) {
        return new AccountSession(new Account("alice", "alice@example.com", "hash", true),
                tokenHash, expiresAt, NOW.minus(1, ChronoUnit.DAYS));
    }
}
