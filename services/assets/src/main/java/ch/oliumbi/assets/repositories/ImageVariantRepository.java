package ch.oliumbi.assets.repositories;

import ch.oliumbi.assets.data.entities.ImageVariant;
import ch.oliumbi.assets.domain.ImageSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ImageVariantRepository extends JpaRepository<ImageVariant, UUID> {
    Optional<ImageVariant> findByImageIdAndSize(UUID imageId, ImageSize size);
}
