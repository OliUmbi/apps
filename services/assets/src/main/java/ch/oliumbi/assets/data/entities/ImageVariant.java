package ch.oliumbi.assets.data.entities;

import ch.oliumbi.assets.domain.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "image_variant", schema = "assets",
        uniqueConstraints = @UniqueConstraint(columnNames = {"image_id", "size"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImageVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private ImageSize size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private ImageFormat format;

    @Column(name = "file_key", nullable = false, columnDefinition = "text")
    private String fileKey;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

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

    public ImageVariant(Image image, ImageRendition rendition) {
        this.image = image;
        this.size = rendition.size();
        this.format = rendition.format();
        this.fileKey = rendition.file().key();
        this.width = rendition.width();
        this.height = rendition.height();
        this.byteCount = rendition.file().bytes();
        this.checksum = rendition.file().checksum();
    }
}
