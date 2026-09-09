package ch.oliumbi.messaging.data.entites;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "message", schema = "messaging")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {

    @Id
    private UUID id;

    @Column(nullable = false, columnDefinition = "text")
    private String site;

    @Column(nullable = false, columnDefinition = "text")
    private String type;

    @Column(nullable = false, columnDefinition = "text")
    private String sender;

    @Column(nullable = false, columnDefinition = "text")
    private String recipient;

    @Column(nullable = false, columnDefinition = "text")
    private String subject;

    @Column(nullable = false, columnDefinition = "text")
    private String text;

    @Column(columnDefinition = "text")
    private String html;

    @Setter
    @Column(nullable = false, columnDefinition = "text")
    private String status;

    @Setter
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Setter
    @Column(name = "available_at", nullable = false)
    private Instant availableAt;

    @Setter
    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Setter
    @Column(name = "finished_at")
    private Instant finishedAt;

    @Setter
    @Column(name = "failure_code", columnDefinition = "text")
    private String failureCode;

    @Setter
    @Column(name = "failure_message", columnDefinition = "text")
    private String failureMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Message(UUID id, String site, String type, String sender, String recipient, String subject,
                   String text, String html, String status, int attemptCount, Instant availableAt, Instant requestedAt) {
        this.id = id;
        this.site = site;
        this.type = type;
        this.sender = sender;
        this.recipient = recipient;
        this.subject = subject;
        this.text = text;
        this.html = html;
        this.status = status;
        this.attemptCount = attemptCount;
        this.availableAt = availableAt;
        this.requestedAt = requestedAt;
    }
}
