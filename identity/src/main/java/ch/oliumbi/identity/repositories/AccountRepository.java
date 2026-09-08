package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.Account;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends CrudRepository<Account, UUID> {

    Optional<Account> findByNameAndEnabledTrue(String name);
}
