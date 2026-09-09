package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entites.MessageAttempt;
import org.springframework.data.repository.CrudRepository;
import java.util.*;

public interface MessageAttemptRepository extends CrudRepository<MessageAttempt, UUID> {

    List<MessageAttempt> findByMessageIdOrderByAttemptNumber(UUID messageId);

    Optional<MessageAttempt> findByMessageIdAndAttemptNumber(UUID messageId, int attemptNumber);
}
