package ch.oliumbi.identity.repositories;

import ch.oliumbi.identity.data.entities.AccountPermission;
import ch.oliumbi.identity.data.entities.AccountPermissionId;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface AccountPermissionRepository extends CrudRepository<AccountPermission, AccountPermissionId> {

    /**
     * The insert is idempotent (ON CONFLICT DO NOTHING), so concurrent grants of the same
     * permission cannot race the unique key into a 409. Returns 1 when the row was created.
     */
    @Modifying
    @Query(value = """
            INSERT INTO identity.account_permission (account_id, permission, created_at, updated_at)
            VALUES (:accountId, :permission, :now, :now)
            ON CONFLICT (account_id, permission) DO NOTHING
            """, nativeQuery = true)
    int grantIfAbsent(@Param("accountId") UUID accountId, @Param("permission") String permission, @Param("now") Instant now);
}
