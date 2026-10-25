package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PermissionGrantRequest(
        @NotBlank @Size(max = 255) String permission) {
}
