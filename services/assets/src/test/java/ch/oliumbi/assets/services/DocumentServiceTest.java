package ch.oliumbi.assets.services;

import ch.oliumbi.assets.configurations.AssetsProperties;
import ch.oliumbi.assets.data.entities.Document;
import ch.oliumbi.assets.data.requests.DocumentCreateRequest;
import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.repositories.DocumentRepository;
import ch.oliumbi.assets.services.storage.BlobStorage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class DocumentServiceTest {

    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");
    private static final String SITE = "site-a";

    private final DocumentRepository documents = mock(DocumentRepository.class);
    private final BlobStorage storage = mock(BlobStorage.class);
    private final AssetsProperties properties =
            new AssetsProperties("token", Path.of("media"), 1024, 24, 3_600_000);
    private final DocumentService service = new DocumentService(documents, storage, properties,
            transactions(), new AssetDeletionService(storage, transactions()));

    private static TransactionTemplate transactions() {
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        return new TransactionTemplate(manager);
    }

    @Test
    void wrongSiteDeleteReturnsNotFoundWithoutDeleting() {
        when(documents.findLockedByIdAndSite(ID, SITE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(ID, SITE))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verify(documents, never()).delete(any());
        verify(storage, never()).delete(any(), any());
    }

    @Test
    void unknownIdDeleteReturnsNotFoundWithoutDeleting() {
        when(documents.findLockedByIdAndSite(ID, SITE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(ID, SITE))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verify(documents, never()).delete(any());
        verify(storage, never()).delete(any(), any());
    }

    @Test
    void correctDeleteRemovesMetadataAndFiles() {
        var document = new Document(ID, SITE, true, "guide", 10, "abc");
        when(documents.findLockedByIdAndSite(ID, SITE)).thenReturn(Optional.of(document));

        service.delete(ID, SITE);

        verify(documents).delete(document);
        verify(storage).delete(AssetKind.DOCUMENT, ID);
    }

    @Test
    void oversizedUploadIsRejectedBeforeStaging() throws Exception {
        var file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1025L);

        assertThatThrownBy(() -> service.create(SITE, new DocumentCreateRequest("guide", true), file))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONTENT_TOO_LARGE));

        verifyNoInteractions(storage, documents);
    }
}
