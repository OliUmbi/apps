package ch.oliumbi.messaging.data.entites;

import ch.oliumbi.messaging.domain.*;
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
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "queue_id", nullable = false, unique = true, updatable = false)
    private UUID queueId;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private MessageStatus status;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    // Exactly one lifecycle timestamp is populated, according to status.
    @Column(name = "available_at")
    private Instant availableAt;

    @Column(name = "locked_at")
    private Instant lockedAt;

    // Producer time, independent of delivery state and persistence audit times.
    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Message(QueuedMessage request, DeliveryState initialState) {
        this.queueId = request.getId();
        this.site = request.getSite();
        this.type = request.getType();
        this.sender = request.getSender();
        this.recipient = request.getRecipient();
        this.subject = request.getSubject();
        this.text = request.getText();
        this.html = request.getHtml();
        this.requestedAt = request.getCreatedAt();
        apply(initialState);
    }

    public DeliveryState state() {
        return switch (status) {
            case PENDING -> new DeliveryState.Pending(attemptCount, availableAt);
            case PROCESSING -> new DeliveryState.Processing(attemptCount, lockedAt);
            case SENT -> new DeliveryState.Sent(attemptCount, finishedAt);
            case FAILED -> new DeliveryState.Failed(attemptCount, finishedAt);
        };
    }

    public void apply(DeliveryState state) {
        attemptCount = state.attempts();
        availableAt = null;
        lockedAt = null;
        finishedAt = null;
        switch (state) {
            case DeliveryState.Pending pending -> {
                status = MessageStatus.PENDING;
                availableAt = pending.availableAt();
            }
            case DeliveryState.Processing processing -> {
                status = MessageStatus.PROCESSING;
                lockedAt = processing.lockedAt();
            }
            case DeliveryState.Sent sent -> {
                status = MessageStatus.SENT;
                finishedAt = sent.finishedAt();
            }
            case DeliveryState.Failed failed -> {
                status = MessageStatus.FAILED;
                finishedAt = failed.finishedAt();
            }
        }
    }

    public DeliveryClaim claim() {
        if (status != MessageStatus.PROCESSING) throw new IllegalStateException("Message is not processing");
        return new DeliveryClaim(id, attemptCount, site, type, sender, recipient, subject, text, html);
    }
}
