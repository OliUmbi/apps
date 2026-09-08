package ch.oliumbi.identity.data.requests;

import ch.oliumbi.identity.data.entites.Account;

import java.util.UUID;

public record SessionActorResponse(
        UUID id,
        String name) {

    public static SessionActorResponse fromAccount(Account account) {
        return new SessionActorResponse(account.getId(), account.getName());
    }
}
