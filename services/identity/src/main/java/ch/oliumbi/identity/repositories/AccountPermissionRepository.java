package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entities.AccountPermission;
import ch.oliumbi.identity.data.entities.AccountPermissionId;
import org.springframework.data.repository.CrudRepository;

public interface AccountPermissionRepository extends CrudRepository<AccountPermission, AccountPermissionId> {
}
