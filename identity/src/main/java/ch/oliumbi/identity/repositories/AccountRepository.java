package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.Account;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends CrudRepository<Account, UUID> {

    Optional<Account> findByNameAndEnabledTrue(String name);
}
