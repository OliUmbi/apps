package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;

public record SessionValidateRequest(
        @NotBlank String token) {
}
