package ch.oliumbi.assets.repositories;

import ch.oliumbi.assets.data.entities.Image;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {
    Page<Image> findBySite(String site, Pageable pageable);

    Page<Image> findBySiteAndVisible(String site, boolean visible, Pageable pageable);

    Optional<Image> findByIdAndSite(UUID id, String site);

    Optional<Image> findByIdAndVisibleTrue(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Image> findLockedByIdAndSite(UUID id, String site);

}
