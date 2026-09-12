package ch.oliumbi.assets.data.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document", schema = "assets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Document {
    @Id
    private UUID id;

    @Column(nullable = false, columnDefinition = "text")
    private String site;

    @Setter
    @Column(name = "public", nullable = false)
    private boolean visible;

    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String slug;

    @Column(name = "byte_count", nullable = false)
    private long byteCount;

    @Column(nullable = false, columnDefinition = "text")
    private String checksum;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Document(UUID id, String site, boolean visible, String slug, long byteCount, String checksum) {
        this.id = id;
        this.site = site;
        this.visible = visible;
        this.slug = slug;
        this.byteCount = byteCount;
        this.checksum = checksum;
    }

    public String getFilename() {
        return slug + ".pdf";
    }
}
