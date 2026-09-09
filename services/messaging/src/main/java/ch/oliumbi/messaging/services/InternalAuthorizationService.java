package ch.oliumbi.messaging.services;

import ch.oliumbi.shared.security.BearerTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

// todo this service does not add a lot of value and could be replaced by just directly using the BearerTokenVerifier in the controller
@Service
@RequiredArgsConstructor
public class InternalAuthorizationService {

    private final BearerTokenVerifier verifier;

    public boolean valid(String authorization) {
        return verifier.valid(authorization);
    }

    public void requireValid(String authorization) {
        if (!valid(authorization)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }
}
