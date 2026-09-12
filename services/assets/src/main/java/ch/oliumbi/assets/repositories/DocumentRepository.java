package ch.oliumbi.assets.repositories;

import ch.oliumbi.assets.data.entities.Document;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    Page<Document> findBySite(String site, Pageable pageable);

    Page<Document> findBySiteAndVisible(String site, boolean visible, Pageable pageable);

    Optional<Document> findByIdAndSite(UUID id, String site);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Document> findLockedByIdAndSite(UUID id, String site);

    Optional<Document> findBySlugAndVisibleTrue(String slug);
}
