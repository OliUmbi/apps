package ch.oliumbi.assets.services;

import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.services.storage.BlobStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Slf4j
@Service
class AssetDeletionService {

    private final BlobStorage storage;
    private final TransactionTemplate transactions;

    AssetDeletionService(BlobStorage storage, TransactionTemplate transactions) {
        this.storage = storage;
        this.transactions = transactions;
    }

    void delete(AssetKind kind, UUID id, Runnable deleteMetadata) {
        // The metadata step reports "unknown id or wrong site" by throwing 404 before anything is removed.
        transactions.executeWithoutResult(status -> deleteMetadata.run());

        try {
            storage.delete(kind, id);
        } catch (RuntimeException exception) {
            log.warn("{} {} file deletion deferred to cleanup ({})", kind, id,
                    exception.getClass().getSimpleName());
        }
    }
}
