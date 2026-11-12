package ch.oliumbi.identity.services;

import ch.oliumbi.identity.data.entities.Account;
import ch.oliumbi.identity.data.requests.AccountCreateRequest;
import ch.oliumbi.identity.data.requests.AccountPasswordRequest;
import ch.oliumbi.identity.data.requests.AccountProfileUpdateRequest;
import ch.oliumbi.identity.data.requests.AccountUpdateRequest;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AccountServiceTest {

    private static final UUID ID = UUID.randomUUID();
    private static final String OLD_PASSWORD = "OldHorse1a";
    private static final String NEW_PASSWORD = "NewHorse1a";
    private static final Instant NOW = Instant.parse("2026-11-06T12:00:00Z");

    private AccountRepository accounts;
    private AccountSessionRepository sessions;
    private PasswordService passwordService;
    private AccountService service;

    @BeforeEach
    void setUp() {
        accounts = mock(AccountRepository.class);
        sessions = mock(AccountSessionRepository.class);
        // A real encoder keeps the password path honest: a stored hash must verify the
        // password that produced it, which a mocked PasswordService could never prove.
        passwordService = new PasswordService(new BCryptPasswordEncoder());
        service = new AccountService(accounts, sessions, new IdentityInputNormalizer(), passwordService,
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

    @Test
    void createStoresANormalizedAccountWithAVerifiablePasswordHash() {
        when(accounts.existsByNameOrEmail("alice", "alice@example.com")).thenReturn(false);
        when(accounts.saveAndFlush(any(Account.class))).thenAnswer(call -> call.getArgument(0));

        var response = service.create(
                new AccountCreateRequest("  Alice  ", " ALICE@EXAMPLE.COM ", "CorrectHorse1"));

        var stored = ArgumentCaptor.forClass(Account.class);
        verify(accounts).saveAndFlush(stored.capture());
        assertEquals("alice", stored.getValue().getName());
        assertEquals("alice@example.com", stored.getValue().getEmail());
        assertTrue(stored.getValue().isEnabled());
        assertNotEquals("CorrectHorse1", stored.getValue().getPasswordHash());
        assertTrue(passwordService.matches("CorrectHorse1", stored.getValue().getPasswordHash()));
        assertFalse(passwordService.matches("WrongHorse1", stored.getValue().getPasswordHash()));
        assertEquals("alice", response.name());
    }

    @Test
    void createRejectsANameOrEmailThatIsAlreadyTaken() {
        when(accounts.existsByNameOrEmail("alice", "alice@example.com")).thenReturn(true);

        var exception = assertThrows(ResponseStatusException.class, () -> service.create(
                new AccountCreateRequest("  Alice  ", " ALICE@EXAMPLE.COM ", "CorrectHorse1")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(accounts, never()).saveAndFlush(any(Account.class));
    }

    @Test
    void updateRejectsANameOrEmailUsedByAnotherAccount() {
        var account = existingAccount(true);
        when(accounts.findByNameOrEmail("alice", "alice@example.com"))
                .thenReturn(List.of(otherAccount()));

        var exception = assertThrows(ResponseStatusException.class,
                () -> service.update(ID, new AccountUpdateRequest("Alice", "alice@example.com", false)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        // The conflict is detected before anything is written or revoked.
        assertEquals("old", account.getName());
        assertEquals("old@example.com", account.getEmail());
        assertTrue(account.isEnabled());
        verify(accounts, never()).saveAndFlush(any(Account.class));
        verifyNoInteractions(sessions);
    }

    @Test
    void updateAllowsAnAccountToKeepItsOwnNameAndEmail() {
        var account = existingAccount(true);
        when(accounts.findByNameOrEmail("old", "old@example.com")).thenReturn(List.of(account));
        when(accounts.saveAndFlush(account)).thenReturn(account);

        var response = service.update(ID, new AccountUpdateRequest("  OLD  ", "OLD@example.com", true));

        assertEquals("old", account.getName());
        assertEquals("old@example.com", account.getEmail());
        assertTrue(response.enabled());
        verifyNoInteractions(sessions);
    }

    @Test
    void profileUpdateAllowsAnAccountToKeepItsOwnNameAndEmail() {
        var account = existingAccount(true);
        when(accounts.findByNameOrEmail("old", "old@example.com")).thenReturn(List.of(account));
        when(accounts.saveAndFlush(account)).thenReturn(account);

        service.updateProfile(ID, new AccountProfileUpdateRequest("old", "old@example.com"));

        assertEquals("old", account.getName());
        assertEquals("old@example.com", account.getEmail());
        verifyNoInteractions(sessions);
    }

    @Test
    void changePasswordStoresAVerifiableHashAndRevokesSessions() {
        var account = existingAccount(true);

        service.changePassword(ID, new AccountPasswordRequest(NEW_PASSWORD));

        assertTrue(passwordService.matches(NEW_PASSWORD, account.getPasswordHash()));
        assertFalse(passwordService.matches(OLD_PASSWORD, account.getPasswordHash()));
        verify(accounts).save(account);
        verify(sessions).revokeByAccountId(ID, NOW);
    }

    @Test
    void changePasswordRejectsAPasswordOutsideThePolicyWithoutWriting() {
        var account = existingAccount(true);
        var previousHash = account.getPasswordHash();

        var exception = assertThrows(ResponseStatusException.class,
                () -> service.changePassword(ID, new AccountPasswordRequest("weak")));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals(previousHash, account.getPasswordHash());
        verify(accounts, never()).save(any(Account.class));
        verifyNoInteractions(sessions);
    }

    private Account existingAccount(boolean enabled) {
        var account = new Account("old", "old@example.com", passwordService.encode(OLD_PASSWORD), enabled);
        ReflectionTestUtils.setField(account, "id", ID);
        when(accounts.findLockedById(ID)).thenReturn(Optional.of(account));
        when(accounts.findByNameOrEmail(anyString(), anyString())).thenReturn(List.of());
        return account;
    }

    private Account otherAccount() {
        var account = new Account("taken", "taken@example.com", "hash", true);
        ReflectionTestUtils.setField(account, "id", UUID.randomUUID());
        return account;
    }
}
