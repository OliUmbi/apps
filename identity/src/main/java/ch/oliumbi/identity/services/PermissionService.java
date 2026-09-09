package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entites.AccountPermission;
import ch.oliumbi.identity.data.entites.AccountPermissionId;
import ch.oliumbi.identity.data.requests.PermissionGrantRequest;
import ch.oliumbi.identity.data.requests.PermissionRevokeRequest;
import ch.oliumbi.identity.repositories.AccountPermissionRepository;
import ch.oliumbi.identity.repositories.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class PermissionService {

    private final AccountRepository accountRepository;
    private final AccountPermissionRepository accountPermissionRepository;

    public PermissionService(AccountRepository accountRepository, AccountPermissionRepository accountPermissionRepository) {
        this.accountRepository = accountRepository;
        this.accountPermissionRepository = accountPermissionRepository;
    }

    @Transactional(readOnly = true)
    public List<String> list(UUID accountId) {
        if (!accountRepository.existsById(accountId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        // todo i dont really understand this long function name. if it is a performance penalty it might as well be moved into the accountService get since it is a one to many association and will be managed from the account detail page so this endpoint would not be needed
        return accountPermissionRepository.findByIdAccountIdOrderByIdPermission(accountId).stream()
                .map(permission -> permission.getId().getPermission())
                .toList();
    }

    // todo is locked account needed? it is not a problem but im curious
    @Transactional
    public void grant(UUID accountId, PermissionGrantRequest request) {
        var account = accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var permission = requirePermission(request.permission());
        var id = new AccountPermissionId(accountId, permission);

        if (!accountPermissionRepository.existsById(id)) {
            accountPermissionRepository.save(new AccountPermission(account, permission));
        }
    }

    @Transactional
    public void revoke(UUID accountId, PermissionRevokeRequest request) {
        accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        accountPermissionRepository.deleteById(new AccountPermissionId(accountId, requirePermission(request.permission())));
    }

    // todo maybe move this to normalize and validation (it should already not be blank from the request record)
    private String requirePermission(String permission) {
        if (permission == null || permission.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Permission is required");
        }
        return permission.trim();
    }
}
