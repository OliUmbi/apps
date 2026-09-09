package ch.oliumbi.messaging.data.entites;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "message_attempt", schema = "messaging")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "message_id", nullable = false)
    private UUID messageId;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Setter
    @Column(columnDefinition = "text")
    private String outcome;

    @Setter
    @Column(columnDefinition = "text")
    private String message;

    @Setter
    @Column(name = "failure_code", columnDefinition = "text")
    private String failureCode;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Setter
    @Column(name = "finished_at")
    private Instant finishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public MessageAttempt(UUID messageId, int attemptNumber, Instant startedAt) {
        this.messageId = messageId;
        this.attemptNumber = attemptNumber;
        this.startedAt = startedAt;
    }
}
