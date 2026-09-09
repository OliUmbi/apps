package ch.oliumbi.identity.data.responses;

import ch.oliumbi.identity.data.entites.AccountPermission;

public record PermissionResponse(
        String permission) {

    public static PermissionResponse fromPermission(AccountPermission permission) {
        return new PermissionResponse(permission.getId().getPermission());
    }
}
