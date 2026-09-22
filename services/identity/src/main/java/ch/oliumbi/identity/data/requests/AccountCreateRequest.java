package ch.oliumbi.identity.data.requests;

import ch.oliumbi.identity.validations.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AccountCreateRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @ValidPassword String password) {
}
