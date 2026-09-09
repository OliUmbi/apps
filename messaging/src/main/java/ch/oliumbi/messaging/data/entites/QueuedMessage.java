package ch.oliumbi.messaging.data.entites;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "message", schema = "queue")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QueuedMessage {

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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
