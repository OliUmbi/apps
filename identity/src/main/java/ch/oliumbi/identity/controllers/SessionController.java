package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.responses.SessionActorResponse;
import ch.oliumbi.identity.data.responses.SessionCreateResponse;
import ch.oliumbi.identity.data.requests.*;
import ch.oliumbi.identity.services.InternalAuthorizationService;
import ch.oliumbi.identity.services.SessionService;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
            @Valid @RequestBody SessionCreateRequest sessionCreateRequest
    ) {
        internalAuthorizationService.requireValid(authorization);
        return sessionService.create(sessionCreateRequest);
    }

    @PostMapping("/validate")
    public SessionActorResponse validate(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid @RequestBody SessionValidateRequest sessionValidateRequest) {
        internalAuthorizationService.requireValid(authorization);
        return sessionService.validate(sessionValidateRequest);
    }

    @PostMapping("/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid @RequestBody SessionRevokeRequest sessionRevokeRequest) {
        internalAuthorizationService.requireValid(authorization);
        sessionService.revoke(sessionRevokeRequest);
    }
}
