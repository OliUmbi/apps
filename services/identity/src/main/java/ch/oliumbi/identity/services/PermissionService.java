package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entities.AccountPermissionId;
import ch.oliumbi.identity.data.requests.PermissionGrantRequest;
import ch.oliumbi.identity.data.requests.PermissionRevokeRequest;
import ch.oliumbi.identity.repositories.AccountPermissionRepository;
import ch.oliumbi.identity.repositories.AccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.util.UUID;

@Service
public class PermissionService {

    private final AccountRepository accountRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final IdentityInputNormalizer inputNormalizer;
    private final Clock clock;

    public PermissionService(AccountRepository accountRepository, AccountPermissionRepository accountPermissionRepository,
                             IdentityInputNormalizer inputNormalizer, Clock clock) {
        this.accountRepository = accountRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.inputNormalizer = inputNormalizer;
        this.clock = clock;
    }

    @Transactional
    public void grant(UUID accountId, PermissionGrantRequest request) {
        accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var permission = inputNormalizer.normalizePermission(request.permission());
        try {
            accountPermissionRepository.grantIfAbsent(accountId, permission, clock.instant());
        } catch (DataIntegrityViolationException alreadyGranted) {
            // Granting is idempotent: any residual violation means the permission already
            // exists (or raced with a concurrent grant), which is the requested end state.
        }
    }

    @Transactional
    public void revoke(UUID accountId, PermissionRevokeRequest request) {
        accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var permission = inputNormalizer.normalizePermission(request.permission());
        accountPermissionRepository.deleteById(new AccountPermissionId(accountId, permission));
    }
}
