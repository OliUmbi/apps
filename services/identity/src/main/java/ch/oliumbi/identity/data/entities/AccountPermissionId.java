package ch.oliumbi.identity.data.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.util.UUID;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class AccountPermissionId {

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, columnDefinition = "text")
    private String permission;
}
