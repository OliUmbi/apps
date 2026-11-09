package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.requests.AccountProfileUpdateRequest;
import ch.oliumbi.identity.data.requests.AccountUpdateRequest;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AccountServiceTest {

    private static final UUID ID = UUID.randomUUID();
    private static final Instant NOW = Instant.parse("2026-11-06T12:00:00Z");

    private AccountRepository accounts;
    private AccountSessionRepository sessions;
    private AccountService service;

    @BeforeEach
    void setUp() {
        accounts = mock(AccountRepository.class);
        sessions = mock(AccountSessionRepository.class);
        service = new AccountService(accounts, sessions, new IdentityInputNormalizer(), mock(PasswordService.class),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void profileUpdateCannotReenableADisabledAccount() {
        var account = existingAccount(false);
        when(accounts.saveAndFlush(account)).thenReturn(account);

        var response = service.updateProfile(ID,
                new AccountProfileUpdateRequest("  New Name  ", "NEW@EXAMPLE.COM"));

        assertFalse(account.isEnabled());
        assertFalse(response.enabled());
        assertEquals("new name", account.getName());
        assertEquals("new@example.com", account.getEmail());
        verify(accounts).findLockedById(ID);
        verifyNoInteractions(sessions);
    }

    @Test
    void administrativeUpdateStillOwnsDisableAndSessionRevocation() {
        var account = existingAccount(true);
        when(accounts.saveAndFlush(account)).thenReturn(account);

        service.update(ID, new AccountUpdateRequest("New Name", "new@example.com", false));

        assertFalse(account.isEnabled());
        verify(sessions).revokeByAccountId(ID, NOW);
    }

    private Account existingAccount(boolean enabled) {
        var account = new Account("old", "old@example.com", "hash", enabled);
        when(accounts.findLockedById(ID)).thenReturn(Optional.of(account));
        when(accounts.findByNameOrEmail(anyString(), anyString())).thenReturn(List.of());
        return account;
    }
}
