package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.domain.MessageStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    boolean existsByQueueId(UUID queueId);

    long countByStatus(MessageStatus status);

    /**
     * Milliseconds matter less than the trend: a stalled queue is a pending row
     * older than the alert threshold, not a precise duration.
     */
    @Query(value = """
            SELECT COALESCE(EXTRACT(EPOCH FROM now() - MIN(created_at))::double precision, 0)
            FROM messaging.message
            WHERE status = 'PENDING'
            """, nativeQuery = true)
    double oldestPendingAgeSeconds();

    Page<Message> findByStatus(MessageStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Message> findLockedById(UUID id);

    /**
     * The run-scoped skip list arrives as a delimited UUID string because native-query
     * collection binding is not portable; the text comparison is exact for canonical UUIDs.
     */
    @Query(value = """
            SELECT * FROM messaging.message
            WHERE ((status = 'PENDING' AND available_at <= :now)
                OR (status = 'PROCESSING' AND locked_at <= :staleBefore))
              AND NOT (id::text = ANY(string_to_array(:skip, ',')))
            ORDER BY created_at, id
            LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<Message> findNext(@Param("now") Instant now, @Param("staleBefore") Instant staleBefore,
                               @Param("skip") String skip);
}
