package ch.oliumbi.identity.data.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;

import java.time.Instant;
import java.util.UUID;

@Entity
@DynamicUpdate
@Table(name = "account_session", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "token_hash", nullable = false, unique = true,
            columnDefinition = "text")
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Setter
    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @Setter
    @Column(name = "revoked_at")
    private Instant revokedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public AccountSession(
            Account account,
            String tokenHash,
            Instant expiresAt,
            Instant lastSeenAt) {
        this.account = account;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.lastSeenAt = lastSeenAt;
    }
}
