package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.responses.SessionActorResponse;
import ch.oliumbi.identity.data.responses.SessionCreateResponse;
import ch.oliumbi.identity.data.requests.*;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.identity.services.SessionService;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/session")
public class SessionController {

    private final SessionService sessionService;
    private final BearerTokenVerifier authorization;

    public SessionController(SessionService sessionService, BearerTokenVerifier authorization) {
        this.sessionService = sessionService;
        this.authorization = authorization;
    }

    @PostMapping
    public SessionCreateResponse create(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid @RequestBody SessionCreateRequest sessionCreateRequest
    ) {
        this.authorization.requireValid(authorization);
        return sessionService.create(sessionCreateRequest);
    }

    @PostMapping("/validate")
    public SessionActorResponse validate(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid @RequestBody SessionValidateRequest sessionValidateRequest) {
        this.authorization.requireValid(authorization);
        return sessionService.validate(sessionValidateRequest);
    }

    @PostMapping("/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid @RequestBody SessionRevokeRequest sessionRevokeRequest) {
        this.authorization.requireValid(authorization);
        sessionService.revoke(sessionRevokeRequest);
    }
}
