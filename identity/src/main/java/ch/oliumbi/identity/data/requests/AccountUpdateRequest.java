package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.*;

public record AccountUpdateRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotNull Boolean enabled) {
}
