package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SessionCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 72) String password) {
}
