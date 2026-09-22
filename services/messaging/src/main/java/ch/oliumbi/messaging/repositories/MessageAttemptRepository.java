package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entities.MessageAttempt;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageAttemptRepository extends CrudRepository<MessageAttempt, UUID> {

    List<MessageAttempt> findByMessageIdOrderByAttemptNumber(UUID messageId);

    Optional<MessageAttempt> findByMessageIdAndAttemptNumber(UUID messageId, int attemptNumber);
}
