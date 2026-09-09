package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entites.Message;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByStatus(String status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Message> findLockedById(UUID id);

    @Query(value = """
            SELECT * FROM messaging.message
            WHERE (status = 'pending' AND available_at <= :now)
               OR (status = 'processing' AND locked_at < :staleBefore)
            ORDER BY created_at, id
            LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<Message> findNext(@Param("now") Instant now, @Param("staleBefore") Instant staleBefore);
}
