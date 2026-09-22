package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.requests.PermissionGrantRequest;
import ch.oliumbi.identity.data.requests.PermissionRevokeRequest;
import ch.oliumbi.identity.services.PermissionService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/account/{accountId}/permission")
public class PermissionController {

    private final PermissionService permissionService;
    private final BearerTokenVerifier authorization;

    public PermissionController(PermissionService permissionService, BearerTokenVerifier authorization) {
        this.permissionService = permissionService;
        this.authorization = authorization;
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grant(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                      @PathVariable UUID accountId,
                      @Valid @RequestBody PermissionGrantRequest request) {
        this.authorization.requireValid(authorization);
        permissionService.grant(accountId, request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                       @PathVariable UUID accountId,
                       @Valid @RequestBody PermissionRevokeRequest request) {
        this.authorization.requireValid(authorization);
        permissionService.revoke(accountId, request);
    }
}
