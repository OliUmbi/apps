package ch.oliumbi.identity.data.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "account", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Setter
    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String name;

    @Setter
    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String email;

    @Setter
    @Column(name = "password_hash", nullable = false, columnDefinition = "text")
    private String passwordHash;

    @Setter
    @Column(nullable = false)
    private boolean enabled;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    @OrderBy("id.permission ASC")
    private List<AccountPermission> permissions = new ArrayList<>();

    public Account(String name, String email, String passwordHash, boolean enabled) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.enabled = enabled;
    }
}
