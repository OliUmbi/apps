package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entites.Account;

import ch.oliumbi.identity.data.requests.*;
import ch.oliumbi.identity.data.responses.AccountResponse;
import ch.oliumbi.identity.data.responses.AccountDetailResponse;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountSessionRepository accountSessionRepository;
    private final NormalizeService normalizeService;
    private final PasswordService passwordService;
    private final Clock clock;

    public AccountService(AccountRepository accountRepository, AccountSessionRepository accountSessionRepository,
                          NormalizeService normalizeService, PasswordService passwordService, Clock clock) {
        this.accountRepository = accountRepository;
        this.accountSessionRepository = accountSessionRepository;
        this.normalizeService = normalizeService;
        this.passwordService = passwordService;
        this.clock = clock;
    }

    // todo we might need to think about pagination in the future but for now we leave it as is until the web implementation got further
    @Transactional(readOnly = true)
    public List<AccountResponse> list() {
        return accountRepository.findAll().stream()
                .map(AccountResponse::fromAccount)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountDetailResponse get(UUID id) {
        return accountRepository.findDetailedById(id)
                .map(AccountDetailResponse::fromAccount)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public AccountResponse create(AccountCreateRequest request) {
        var name = normalizeService.normalizeName(request.name());
        var email = normalizeService.normalizeEmail(request.email());

        if (!isAvailable(name, email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name or email already in use");
        }

        var account = new Account(name, email, passwordService.encode(request.password()), true);

        return AccountResponse.fromAccount(accountRepository.saveAndFlush(account));
    }

    @Transactional
    public AccountResponse update(UUID id, AccountUpdateRequest request) {
        var account = accountRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var name = normalizeService.normalizeName(request.name());
        var email = normalizeService.normalizeEmail(request.email());

        if (!isAvailable(name, email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name or email already in use");
        }

        account.setName(name);
        account.setEmail(email);
        account.setEnabled(request.enabled());

        if (!request.enabled()) {
            accountSessionRepository.revokeByAccountId(id, clock.instant());
        }

        return AccountResponse.fromAccount(accountRepository.saveAndFlush(account));
    }

    @Transactional
    public void changePassword(UUID id, AccountPasswordRequest request) {
        var account = accountRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        account.setPasswordHash(passwordService.encode(request.password()));

        accountRepository.save(account);
        accountSessionRepository.revokeByAccountId(id, clock.instant());
    }

    @Transactional
    public void delete(UUID id) {
        var account = accountRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        accountRepository.delete(account);
    }

    private boolean isAvailable(String name, String email) {
        return !accountRepository.existsByNameOrEmail(name, email);
    }

    private boolean isAvailable(String name, String email, UUID excludedAccountId) {
        return accountRepository.findByNameOrEmail(name, email).stream()
                .allMatch(account -> account.getId().equals(excludedAccountId));
    }
}
