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

import java.util.UUID;

@Service
public class PermissionService {

    private final AccountRepository accountRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final NormalizeService normalizeService;

    public PermissionService(AccountRepository accountRepository, AccountPermissionRepository accountPermissionRepository,
                             NormalizeService normalizeService) {
        this.accountRepository = accountRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.normalizeService = normalizeService;
    }

    @Transactional
    public void grant(UUID accountId, PermissionGrantRequest request) {
        var account = accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var permission = normalizeService.normalizePermission(request.permission());
        if (!accountPermissionRepository.existsById(new AccountPermissionId(accountId, permission))) {
            accountPermissionRepository.save(new AccountPermission(account, permission));
        }
    }

    @Transactional
    public void revoke(UUID accountId, PermissionRevokeRequest request) {
        accountRepository.findLockedById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var permission = normalizeService.normalizePermission(request.permission());
        accountPermissionRepository.deleteById(new AccountPermissionId(accountId, permission));
    }
}
