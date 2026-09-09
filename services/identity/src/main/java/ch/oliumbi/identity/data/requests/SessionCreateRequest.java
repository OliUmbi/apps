package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;

public record SessionCreateRequest(
        @NotBlank String name,
        @NotBlank String password) {
}
