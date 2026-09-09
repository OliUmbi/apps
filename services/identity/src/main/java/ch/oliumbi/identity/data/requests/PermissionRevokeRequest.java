package ch.oliumbi.identity.data.requests;

import jakarta.validation.constraints.NotBlank;

public record PermissionRevokeRequest(
        @NotBlank String permission) {
}
