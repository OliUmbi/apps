package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entites.Message;
import ch.oliumbi.messaging.domain.MessageStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    boolean existsByQueueId(UUID queueId);

    Page<Message> findByStatus(MessageStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Message> findLockedById(UUID id);

    @Query(value = """
            SELECT * FROM messaging.message
            WHERE (status = 'PENDING' AND available_at <= :now)
               OR (status = 'PROCESSING' AND locked_at <= :staleBefore)
            ORDER BY created_at, id
            LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<Message> findNext(@Param("now") Instant now, @Param("staleBefore") Instant staleBefore);
}
