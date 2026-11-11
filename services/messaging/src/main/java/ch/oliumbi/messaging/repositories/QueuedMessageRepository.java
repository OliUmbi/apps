package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entities.QueuedMessage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface QueuedMessageRepository extends CrudRepository<QueuedMessage, UUID> {

    /**
     * Age of the oldest unconsumed email inbox row. A normal row lives for
     * milliseconds because intake removes it in the same transaction; a lasting
     * row means intake stopped consuming, and housekeeping never expires it.
     */
    @Query(value = """
            SELECT COALESCE(EXTRACT(EPOCH FROM now() - MIN(created_at))::double precision, 0)
            FROM queue.message
            WHERE type = 'email'
            """, nativeQuery = true)
    double oldestQueuedAgeSeconds();

    /**
     * Only the current channel is consumed; rows for future channels stay untouched in the queue.
     * The run-scoped skip list arrives as a delimited UUID string because native-query
     * collection binding is not portable; the text comparison is exact for canonical UUIDs.
     */
    @Query(value = """
            SELECT * FROM queue.message
            WHERE type = 'email'
              AND NOT (id::text = ANY(string_to_array(:skip, ',')))
            ORDER BY created_at, id
            LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<QueuedMessage> findNext(@Param("skip") String skip);
}
