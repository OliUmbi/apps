package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.requests.SessionActorResponse;
import ch.oliumbi.identity.data.requests.SessionCreateResponse;
import ch.oliumbi.identity.data.responses.*;
import ch.oliumbi.identity.services.InternalAuthorizationService;
import ch.oliumbi.identity.services.SessionService;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/session")
public class SessionController {

    private final SessionService sessionService;
    private final InternalAuthorizationService internalAuthorizationService;

    public SessionController(SessionService sessionService, InternalAuthorizationService internalAuthorizationService) {
        this.sessionService = sessionService;
        this.internalAuthorizationService = internalAuthorizationService;
    }

    @PostMapping
    public SessionCreateResponse create(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestBody SessionCreateRequest sessionCreateRequest
    ) {
        internalAuthorizationService.requireValid(authorization);
        return sessionService.create(sessionCreateRequest);
    }

    @GetMapping
    public SessionActorResponse validate(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestBody SessionValidateRequest sessionValidateRequest) {
        internalAuthorizationService.requireValid(authorization);
        return sessionService.validate(sessionValidateRequest);
    }

    @DeleteMapping
    public void revoke(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestBody SessionRevokeRequest sessionRevokeRequest) {
        internalAuthorizationService.requireValid(authorization);
        sessionService.revoke(sessionRevokeRequest);
    }
}
