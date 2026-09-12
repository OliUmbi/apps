package ch.oliumbi.messaging.data.entities;

import ch.oliumbi.messaging.domain.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Optional;
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

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "text")
    private AttemptOutcome outcome;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private FailureDetail detail;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

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

    public void finish(AttemptOutcome outcome, Optional<FailureDetail> detail, Instant now) {
        if (finishedAt != null) {
            throw new IllegalStateException("Attempt is already finished");
        }
        this.outcome = outcome;
        this.detail = detail.orElse(null);
        this.finishedAt = now;
    }
}
