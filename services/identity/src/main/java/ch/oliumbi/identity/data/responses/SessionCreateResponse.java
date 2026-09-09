package ch.oliumbi.identity.data.responses;

import java.time.Instant;

public record SessionCreateResponse(
        String token,
        Instant expiresAt,
        SessionActorResponse actor
) {
}
