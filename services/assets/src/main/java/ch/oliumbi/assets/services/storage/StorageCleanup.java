package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.repositories.DocumentRepository;
import ch.oliumbi.assets.repositories.ImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageCleanup {
    private final BlobStorage storage;
    private final ImageRepository images;
    private final DocumentRepository documents;

    @Scheduled(fixedDelayString = "${assets.cleanup-delay-ms}", initialDelayString = "${assets.cleanup-delay-ms}")
    public void cleanup() {
        try {
            storage.cleanup(AssetKind.IMAGE, images::existsById);
            storage.cleanup(AssetKind.DOCUMENT, documents::existsById);
        } catch (RuntimeException exception) {
            log.warn("Asset cleanup deferred ({})", exception.getClass().getSimpleName());
        }
    }
}
