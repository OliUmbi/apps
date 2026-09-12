package ch.oliumbi.assets.services;

import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.services.storage.BlobStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;
import java.util.function.BooleanSupplier;

@Slf4j
@Service
class AssetDeletionService {

    private final BlobStorage storage;
    private final TransactionTemplate transactions;

    AssetDeletionService(BlobStorage storage, TransactionTemplate transactions) {
        this.storage = storage;
        this.transactions = transactions;
    }

    void delete(AssetKind kind, UUID id, BooleanSupplier deleteMetadata) {
        var deleted = Boolean.TRUE.equals(transactions.execute(status -> deleteMetadata.getAsBoolean()));
        if (!deleted) {
            return;
        }

        try {
            storage.delete(kind, id);
        } catch (RuntimeException exception) {
            log.warn("{} {} file deletion deferred to cleanup ({})", kind, id,
                    exception.getClass().getSimpleName());
        }
    }
}
