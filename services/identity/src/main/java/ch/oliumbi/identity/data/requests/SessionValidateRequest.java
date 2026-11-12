package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SessionValidateRequest(
        @NotBlank @Size(max = 64) String token) {
}
