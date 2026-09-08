package ch.oliumbi.identity.data.entites;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "account_permission", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountPermission {

    @EmbeddedId
    private AccountPermissionId id;

    @MapsId("accountId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    public AccountPermission(Account account, String permission) {
        this.account = account;
        this.id = new AccountPermissionId(account.getId(), permission);
    }
}
