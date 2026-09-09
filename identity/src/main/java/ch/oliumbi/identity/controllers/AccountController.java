package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.requests.*;
import ch.oliumbi.identity.data.responses.AccountDetailResponse;
import ch.oliumbi.identity.data.responses.AccountResponse;
import ch.oliumbi.identity.services.AccountService;
import ch.oliumbi.identity.services.InternalAuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/account")
public class AccountController {

    private final AccountService accountService;
    private final InternalAuthorizationService internalAuthorizationService;

    public AccountController(AccountService accountService, InternalAuthorizationService internalAuthorizationService) {
        this.accountService = accountService;
        this.internalAuthorizationService = internalAuthorizationService;
    }

    @GetMapping
    public List<AccountResponse> list(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        internalAuthorizationService.requireValid(authorization);
        return accountService.list();
    }

    @GetMapping("/{id}")
    public AccountDetailResponse get(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                     @PathVariable UUID id) {
        internalAuthorizationService.requireValid(authorization);
        return accountService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse create(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                  @Valid @RequestBody AccountCreateRequest request) {
        internalAuthorizationService.requireValid(authorization);
        return accountService.create(request);
    }

    @PutMapping("/{id}")
    public AccountResponse update(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                  @PathVariable UUID id,
                                  @Valid @RequestBody AccountUpdateRequest request) {
        internalAuthorizationService.requireValid(authorization);
        return accountService.update(id, request);
    }

    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                               @PathVariable UUID id,
                               @Valid @RequestBody AccountPasswordRequest request) {
        internalAuthorizationService.requireValid(authorization);
        accountService.changePassword(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                       @PathVariable UUID id) {
        internalAuthorizationService.requireValid(authorization);
        accountService.delete(id);
    }
}
