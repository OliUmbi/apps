package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entites.AccountPermission;
import ch.oliumbi.identity.data.entites.AccountPermissionId;
import org.springframework.data.repository.CrudRepository;

public interface AccountPermissionRepository extends CrudRepository<AccountPermission, AccountPermissionId> {
}
