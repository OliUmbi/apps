package ch.oliumbi.identity.data.requests;

import ch.oliumbi.identity.validations.ValidPassword;
import jakarta.validation.constraints.*;

public record AccountCreateRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @ValidPassword String password) {
}
