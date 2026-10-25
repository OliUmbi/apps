package ch.oliumbi.identity.services;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Deletes sessions once they are past expiresAt + retention, so revoked and expired
 * rows do not accumulate forever.
 */
@Service
public class SessionPurgeService {

    private final AccountSessionRepository accountSessionRepository;
    private final Clock clock;
    private final int sessionRetentionDays;

    public SessionPurgeService(AccountSessionRepository accountSessionRepository, Clock clock,
                               IdentityProperties properties) {
        this.accountSessionRepository = accountSessionRepository;
        this.clock = clock;
        this.sessionRetentionDays = properties.sessionRetentionDays();
    }

    @Scheduled(fixedDelayString = "${identity.session-purge-delay-ms}", initialDelayString = "${identity.session-purge-delay-ms}")
    @Transactional
    public void purge() {
        var cutoff = Instant.now(clock).minus(sessionRetentionDays, ChronoUnit.DAYS);
        accountSessionRepository.deleteByExpiredBefore(cutoff);
    }
}
