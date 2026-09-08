package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.AccountSession;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AccountSessionRepository extends CrudRepository<AccountSession, UUID> {

    @Query("""
            SELECT s
            FROM AccountSession s
            JOIN FETCH s.account a
            WHERE s.tokenHash = :tokenHash
              AND s.revokedAt IS NULL
              AND s.expiresAt > :now
              AND a.enabled = TRUE
            """)
    Optional<AccountSession> findValidSession(
            @Param("tokenHash") String tokenHash,
            @Param("now") Instant now);
}
