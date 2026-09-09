package ch.oliumbi.identity.data.requests;

import ch.oliumbi.identity.validations.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record AccountPasswordRequest(
        @NotBlank @ValidPassword String password) {
}
