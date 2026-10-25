package ch.oliumbi.identity.services;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.entities.AccountSession;
import ch.oliumbi.identity.data.requests.SessionCreateRequest;
import ch.oliumbi.identity.data.requests.SessionRevokeRequest;
import ch.oliumbi.identity.data.requests.SessionValidateRequest;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SessionServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    private final AccountRepository accounts = mock(AccountRepository.class);
    private final AccountSessionRepository sessions = mock(AccountSessionRepository.class);
    private final PasswordService passwordService = new PasswordService(new BCryptPasswordEncoder());
    private final TokenService tokenService = new TokenService();
    private final SessionService sessionService = new SessionService(
            accounts, sessions, new IdentityInputNormalizer(), tokenService,
            Clock.fixed(NOW, ZoneOffset.UTC), passwordService,
            new IdentityProperties("internal-token", 7));

    private Account account() {
        return new Account("alice", "alice@example.com", passwordService.encode("CorrectHorse1"), true);
    }

    @Test
    void createRejectsAnUnknownAccount() {
        when(accounts.findByNameAndEnabledTrue("alice")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.create(new SessionCreateRequest("Alice", "CorrectHorse1")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(exception -> ((ResponseStatusException) exception).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void createRejectsAWrongPassword() {
        when(accounts.findByNameAndEnabledTrue("alice")).thenReturn(Optional.of(account()));

        assertThatThrownBy(() -> sessionService.create(new SessionCreateRequest("Alice", "WrongHorse1")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void createStoresTheTokenHashedAndExpiresTheSessionInSevenDays() {
        var account = account();
        when(accounts.findByNameAndEnabledTrue("alice")).thenReturn(Optional.of(account));

        var response = sessionService.create(new SessionCreateRequest("Alice", "CorrectHorse1"));

        var saved = ArgumentCaptor.forClass(AccountSession.class);
        verify(sessions).save(saved.capture());
        assertThat(saved.getValue().getTokenHash()).isEqualTo(tokenService.hash(response.token()));
        assertThat(saved.getValue().getTokenHash()).isNotEqualTo(response.token());
        assertThat(saved.getValue().getExpiresAt()).isEqualTo(NOW.plus(7, ChronoUnit.DAYS));
        assertThat(saved.getValue().getAccount()).isSameAs(account);
    }

    @Test
    void validateReturnsTheActorAndTouchesLastSeen() {
        var session = new AccountSession(account(), "hash", NOW.plus(7, ChronoUnit.DAYS), NOW.minusSeconds(60));
        when(sessions.findValidSession(tokenService.hash("the-token"), NOW)).thenReturn(Optional.of(session));

        var actor = sessionService.validate(new SessionValidateRequest("the-token"));

        assertThat(actor).isNotNull();
        assertThat(session.getLastSeenAt()).isEqualTo(NOW);
    }

    @Test
    void validateRejectsAnUnknownToken() {
        when(sessions.findValidSession(any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.validate(new SessionValidateRequest("unknown")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void revokeMarksTheSessionRevoked() {
        var session = new AccountSession(account(), "hash", NOW.plus(7, ChronoUnit.DAYS), NOW);
        when(sessions.findValidSession(tokenService.hash("the-token"), NOW)).thenReturn(Optional.of(session));

        sessionService.revoke(new SessionRevokeRequest("the-token"));

        assertThat(session.getRevokedAt()).isEqualTo(NOW);
    }

    @Test
    void revokeRejectsAnUnknownToken() {
        when(sessions.findValidSession(any(), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.revoke(new SessionRevokeRequest("unknown")))
                .isInstanceOf(ResponseStatusException.class);
    }
}
