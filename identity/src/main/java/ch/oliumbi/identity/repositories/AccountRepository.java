package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    boolean existsByNameOrEmail(String name, String email);

    List<Account> findByNameOrEmail(String name, String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findLockedById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findByNameAndEnabledTrue(String name);
}
