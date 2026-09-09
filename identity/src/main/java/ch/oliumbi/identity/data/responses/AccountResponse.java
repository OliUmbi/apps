package ch.oliumbi.identity.data.responses;

import ch.oliumbi.identity.data.entites.Account;

import java.time.Instant;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        String email,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt) {

    public static AccountResponse fromAccount(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getEmail(),
                account.isEnabled(),
                account.getCreatedAt(),
                account.getUpdatedAt());
    }
}
