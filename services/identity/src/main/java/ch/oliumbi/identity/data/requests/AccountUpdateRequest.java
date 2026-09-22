package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AccountUpdateRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotNull Boolean enabled) {
}
