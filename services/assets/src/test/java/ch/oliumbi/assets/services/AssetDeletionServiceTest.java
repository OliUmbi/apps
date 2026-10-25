package ch.oliumbi.assets.services;

import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.services.storage.BlobStorage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssetDeletionServiceTest {

    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");

    private final BlobStorage storage = mock(BlobStorage.class);
    private final AssetDeletionService deletion = new AssetDeletionService(storage, transactions());

    private static TransactionTemplate transactions() {
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        return new TransactionTemplate(manager);
    }

    @Test
    void fileDeletionFailureDoesNotFailTheDelete() {
        doThrow(new IllegalStateException("disk")).when(storage).delete(AssetKind.IMAGE, ID);
        var deleted = new AtomicBoolean();

        assertThatCode(() -> deletion.delete(AssetKind.IMAGE, ID, () -> deleted.set(true)))
                .doesNotThrowAnyException();

        assertThat(deleted).isTrue();
    }

    @Test
    void aMissingAssetStopsBeforeAnyFileDeletion() {
        assertThatThrownBy(() -> deletion.delete(AssetKind.DOCUMENT, ID, () -> {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verify(storage, never()).delete(any(), any());
    }
}
