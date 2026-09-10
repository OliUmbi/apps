package ch.oliumbi.assets.data.entites;

import ch.oliumbi.assets.domain.ImageRendition;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "image", schema = "assets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Image {
    @OneToMany(mappedBy = "image", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<ImageVariant> variants = new ArrayList<>();
    @Id
    private UUID id;
    @Column(nullable = false, columnDefinition = "text")
    private String site;
    @Setter
    @Column(name = "public", nullable = false)
    private boolean visible;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Image(UUID id, String site, boolean visible) {
        this.id = id;
        this.site = site;
        this.visible = visible;
    }

    public void addVariant(ImageRendition rendition) {
        variants.add(new ImageVariant(this, rendition));
    }
}
