package ch.oliumbi.identity.data.requests;

import java.time.Instant;

public record SessionCreateResponse(
        String token,
        Instant expiresAt,
        SessionActorResponse actor
) {
}
