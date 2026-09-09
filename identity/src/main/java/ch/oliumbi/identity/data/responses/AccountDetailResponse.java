package ch.oliumbi.identity.data.responses;

import ch.oliumbi.identity.data.entites.Account;

import java.util.List;

public record AccountDetailResponse(
        AccountResponse account,
        List<PermissionResponse> permissions) {

    public static AccountDetailResponse fromAccount(Account account) {
        return new AccountDetailResponse(AccountResponse.fromAccount(account),
                account.getPermissions().stream().map(PermissionResponse::fromPermission).toList());
    }
}
