package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.AccountPermission;
import ch.oliumbi.identity.data.entites.AccountPermissionId;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface AccountPermissionRepository extends CrudRepository<AccountPermission, AccountPermissionId> {

    List<AccountPermission> findByIdAccountIdOrderByIdPermission(UUID accountId);
}
