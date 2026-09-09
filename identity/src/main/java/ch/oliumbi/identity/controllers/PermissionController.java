package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.requests.PermissionGrantRequest;
import ch.oliumbi.identity.data.requests.PermissionRevokeRequest;
import ch.oliumbi.identity.services.InternalAuthorizationService;
import ch.oliumbi.identity.services.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/account/{accountId}/permission")
public class PermissionController {

    private final PermissionService permissionService;
    private final InternalAuthorizationService internalAuthorizationService;

    public PermissionController(PermissionService permissionService, InternalAuthorizationService internalAuthorizationService) {
        this.permissionService = permissionService;
        this.internalAuthorizationService = internalAuthorizationService;
    }

    // todo i dislike just returning a raw string list. should be in an record to allow future expansion of the interface
    @GetMapping
    public List<String> list(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                             @PathVariable UUID accountId) {
        internalAuthorizationService.requireValid(authorization);
        return permissionService.list(accountId);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grant(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                      @PathVariable UUID accountId,
                      @Valid @RequestBody PermissionGrantRequest request) {
        internalAuthorizationService.requireValid(authorization);
        permissionService.grant(accountId, request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                       @PathVariable UUID accountId,
                       @Valid @RequestBody PermissionRevokeRequest request) {
        internalAuthorizationService.requireValid(authorization);
        permissionService.revoke(accountId, request);
    }
}
