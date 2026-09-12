package ch.oliumbi.identity.services;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.data.entities.AccountSession;
import ch.oliumbi.identity.data.requests.*;
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

    private final AccountRepository accountRepository;
    private final AccountSessionRepository accountSessionRepository;
    private final NormalizeService normalizeService;
    private final TokenService tokenService;
    private final Clock clock;
    private final PasswordService passwordService;
    private final int sessionExpirationDays;

    public SessionService(AccountRepository accountRepository, AccountSessionRepository accountSessionRepository,
                          NormalizeService normalizeService, TokenService tokenService, Clock clock,
                          PasswordService passwordService, IdentityProperties properties) {
        this.accountRepository = accountRepository;
        this.accountSessionRepository = accountSessionRepository;
        this.normalizeService = normalizeService;
        this.tokenService = tokenService;
        this.clock = clock;
        this.passwordService = passwordService;
        this.sessionExpirationDays = properties.sessionExpirationDays();
    }

    @Transactional
    public SessionCreateResponse create(SessionCreateRequest sessionCreateRequest) {

        var normalizedName = normalizeService.normalizeName(sessionCreateRequest.name());

        var account = accountRepository.findByNameAndEnabledTrue(normalizedName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (!passwordService.matches(sessionCreateRequest.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        var token = tokenService.generate();
        var tokenHash = tokenService.hash(token);
        var now = Instant.now(clock);
        var expiresAt = now.plus(sessionExpirationDays, ChronoUnit.DAYS);

        var accountSession = new AccountSession(account, tokenHash, expiresAt, now);
        accountSessionRepository.save(accountSession);

        return new SessionCreateResponse(token, expiresAt, SessionActorResponse.fromAccount(account));
    }

    @Transactional
    public SessionActorResponse validate(SessionValidateRequest sessionValidateRequest) {
        var tokenHash = tokenService.hash(sessionValidateRequest.token());
        var now = Instant.now(clock);

        var accountSession = accountSessionRepository.findValidSession(tokenHash, now)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        accountSession.setLastSeenAt(now);

        return SessionActorResponse.fromAccount(accountSession.getAccount());
    }

    @Transactional
    public void revoke(SessionRevokeRequest sessionRevokeRequest) {
        var tokenHash = tokenService.hash(sessionRevokeRequest.token());
        var now = Instant.now(clock);

        var accountSession = accountSessionRepository.findValidSession(tokenHash, now)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        accountSession.setRevokedAt(now);
    }
}
