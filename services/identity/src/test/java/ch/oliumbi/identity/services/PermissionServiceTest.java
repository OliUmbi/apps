package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.entities.AccountPermissionId;
import ch.oliumbi.identity.data.requests.PermissionGrantRequest;
import ch.oliumbi.identity.data.requests.PermissionRevokeRequest;
import ch.oliumbi.identity.repositories.AccountPermissionRepository;
import ch.oliumbi.identity.repositories.AccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PermissionServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");
    private static final UUID ACCOUNT_ID = UUID.randomUUID();

    private final AccountRepository accounts = mock(AccountRepository.class);
    private final AccountPermissionRepository permissions = mock(AccountPermissionRepository.class);
    private final PermissionService permissionService = new PermissionService(
            accounts, permissions, new IdentityInputNormalizer(), Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void grantInsertsTheNormalizedPermission() {
        when(accounts.findLockedById(ACCOUNT_ID)).thenReturn(Optional.of(account()));

        permissionService.grant(ACCOUNT_ID, new PermissionGrantRequest("  studio.admin  "));

        verify(permissions).grantIfAbsent(ACCOUNT_ID, "studio.admin", NOW);
    }

    @Test
    void repeatedGrantsBothSucceed() {
        when(accounts.findLockedById(ACCOUNT_ID)).thenReturn(Optional.of(account()));
        when(permissions.grantIfAbsent(any(), any(), any())).thenReturn(1).thenReturn(0);

        assertThatCode(() -> {
            permissionService.grant(ACCOUNT_ID, new PermissionGrantRequest("studio.admin"));
            permissionService.grant(ACCOUNT_ID, new PermissionGrantRequest("studio.admin"));
        }).doesNotThrowAnyException();
    }

    @Test
    void grantTreatsAConstraintViolationAsAlreadyGranted() {
        when(accounts.findLockedById(ACCOUNT_ID)).thenReturn(Optional.of(account()));
        when(permissions.grantIfAbsent(any(), any(), any()))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));

        assertThatCode(() -> permissionService.grant(ACCOUNT_ID, new PermissionGrantRequest("studio.admin")))
                .doesNotThrowAnyException();
    }

    @Test
    void grantRejectsAnUnknownAccount() {
        when(accounts.findLockedById(ACCOUNT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> permissionService.grant(ACCOUNT_ID, new PermissionGrantRequest("studio.admin")))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void revokeDeletesThePermission() {
        when(accounts.findLockedById(ACCOUNT_ID)).thenReturn(Optional.of(account()));

        permissionService.revoke(ACCOUNT_ID, new PermissionRevokeRequest("studio.admin"));

        verify(permissions).deleteById(new AccountPermissionId(ACCOUNT_ID, "studio.admin"));
    }

    private static Account account() {
        return new Account("alice", "alice@example.com", "hash", true);
    }
}
