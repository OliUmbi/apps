package ch.oliumbi.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/sessions")
class IdentityController {
    private final IdentityService identity;
    private final String internalToken;

    IdentityController(IdentityService identity, @Value("${identity.internal-token}") String internalToken) {
        this.identity = identity;
        this.internalToken = internalToken;
    }

    @PostMapping
    IdentityService.SessionCreated create(
            @RequestHeader("X-Internal-Token") String suppliedToken,
            @RequestBody LoginRequest request) {
        authorize(suppliedToken);
        return identity.authenticate(request.username(), request.password());
    }

    @GetMapping("/current")
    IdentityService.Actor current(
            @RequestHeader("X-Internal-Token") String suppliedToken,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        authorize(suppliedToken);
        return identity.validate(bearer(authorization));
    }

    @DeleteMapping("/current")
    void delete(
            @RequestHeader("X-Internal-Token") String suppliedToken,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        authorize(suppliedToken);
        identity.revoke(bearer(authorization));
    }

    private void authorize(String suppliedToken) {
        if (!MessageDigestSupport.constantTimeEquals(internalToken, suppliedToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }

    private String bearer(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return authorization.substring(7);
    }

    record LoginRequest(String username, String password) {
    }
}
