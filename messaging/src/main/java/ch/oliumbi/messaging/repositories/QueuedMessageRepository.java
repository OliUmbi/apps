package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entites.QueuedMessage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface QueuedMessageRepository extends CrudRepository<QueuedMessage, UUID> {

    @Query(value = """
            SELECT * FROM queue.message
            ORDER BY created_at, id
            LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<QueuedMessage> findNext();
}
