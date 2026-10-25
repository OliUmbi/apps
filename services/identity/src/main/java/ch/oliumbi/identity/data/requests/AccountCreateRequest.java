package ch.oliumbi.identity.data.requests;

import ch.oliumbi.identity.validations.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @ValidPassword String password) {
}
