package ch.oliumbi.identity.services;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.data.entities.AccountSession;
import ch.oliumbi.identity.data.requests.SessionCreateRequest;
import ch.oliumbi.identity.data.requests.SessionRevokeRequest;
import ch.oliumbi.identity.data.requests.SessionValidateRequest;
import ch.oliumbi.identity.data.responses.SessionActorResponse;
import ch.oliumbi.identity.data.responses.SessionCreateResponse;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class SessionService {

    /**
     * Writes to lastSeenAt are throttled to this interval to avoid one update per request.
     */
    private static final int LAST_SEEN_WRITE_INTERVAL_MINUTES = 5;

    private final AccountRepository accountRepository;
    private final AccountSessionRepository accountSessionRepository;
    private final IdentityInputNormalizer inputNormalizer;
    private final TokenService tokenService;
    private final Clock clock;
    private final PasswordService passwordService;
    private final int sessionExpirationDays;

    public SessionService(AccountRepository accountRepository, AccountSessionRepository accountSessionRepository,
                          IdentityInputNormalizer inputNormalizer, TokenService tokenService, Clock clock,
                          PasswordService passwordService, IdentityProperties properties) {
        this.accountRepository = accountRepository;
        this.accountSessionRepository = accountSessionRepository;
        this.inputNormalizer = inputNormalizer;
        this.tokenService = tokenService;
        this.clock = clock;
        this.passwordService = passwordService;
        this.sessionExpirationDays = properties.sessionExpirationDays();
    }

    @Transactional
    public SessionCreateResponse create(SessionCreateRequest sessionCreateRequest) {

        var normalizedName = inputNormalizer.normalizeName(sessionCreateRequest.name());

        var account = accountRepository.findByNameAndEnabledTrue(normalizedName);

        if (account.isEmpty()) {
            // The unknown-account path pays the same BCrypt cost as the wrong-password path,
            // so response time does not reveal whether an account exists. The 401 stays bare
            // for the same reason.
            passwordService.matchesDummy(sessionCreateRequest.password());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        if (!passwordService.matches(sessionCreateRequest.password(), account.get().getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        var authenticated = account.get();
        var token = tokenService.generate();
        var tokenHash = tokenService.hash(token);
        var now = Instant.now(clock);
        var expiresAt = now.plus(sessionExpirationDays, ChronoUnit.DAYS);

        var accountSession = new AccountSession(authenticated, tokenHash, expiresAt, now);
        accountSessionRepository.save(accountSession);

        return new SessionCreateResponse(token, expiresAt, SessionActorResponse.fromAccount(authenticated));
    }

    @Transactional
    public SessionActorResponse validate(SessionValidateRequest sessionValidateRequest) {
        var tokenHash = tokenService.hash(sessionValidateRequest.token());
        var now = Instant.now(clock);

        var accountSession = accountSessionRepository.findValidSession(tokenHash, now)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Session token is expired, revoked or unknown"));

        // Throttled so a busy session does not produce one write per request.
        if (accountSession.getLastSeenAt().isBefore(now.minus(LAST_SEEN_WRITE_INTERVAL_MINUTES, ChronoUnit.MINUTES))) {
            accountSession.setLastSeenAt(now);
        }

        return SessionActorResponse.fromAccount(accountSession.getAccount());
    }

    /**
     * Revoking a dead token is a no-op so a retried sign-out after a timeout still succeeds.
     */
    @Transactional
    public void revoke(SessionRevokeRequest sessionRevokeRequest) {
        var tokenHash = tokenService.hash(sessionRevokeRequest.token());

        accountSessionRepository.revokeByTokenHash(tokenHash, Instant.now(clock));
    }
}
