package ch.oliumbi.assets.services;

import ch.oliumbi.assets.configurations.ImageProperties;
import ch.oliumbi.assets.data.entities.Image;
import ch.oliumbi.assets.data.entities.ImageVariant;
import ch.oliumbi.assets.data.requests.ImageCreateRequest;
import ch.oliumbi.assets.domain.AssetContent;
import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.domain.ImageFormat;
import ch.oliumbi.assets.domain.ImageRendition;
import ch.oliumbi.assets.domain.ImageSize;
import ch.oliumbi.assets.domain.StoredFile;
import ch.oliumbi.assets.repositories.ImageRepository;
import ch.oliumbi.assets.repositories.ImageVariantRepository;
import ch.oliumbi.assets.services.processing.ImageProcessor;
import ch.oliumbi.assets.services.storage.BlobStorage;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ImageServiceTest {

    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");
    private static final String SITE = "site-a";

    private final ImageRepository images = mock(ImageRepository.class);
    private final ImageVariantRepository variants = mock(ImageVariantRepository.class);
    private final BlobStorage storage = mock(BlobStorage.class);
    private final ImageProcessor processor = mock(ImageProcessor.class);
    private final ImageProperties properties = new ImageProperties(1024, 40_000_000, 12_000, 3072, 1);
    private final ImageService service = new ImageService(images, variants, storage, processor, properties,
            transactions(), new AssetDeletionService(storage, transactions()));

    private static TransactionTemplate transactions() {
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        return new TransactionTemplate(manager);
    }

    @Test
    void listWithoutVisibilityUsesTheWholeSite() {
        var pageable = PageRequest.of(0, 20);
        when(images.findBySite(SITE, pageable)).thenReturn(Page.empty());

        service.list(SITE, null, pageable);

        verify(images).findBySite(SITE, pageable);
        verify(images, never()).findBySiteAndVisible(anyString(), anyBoolean(), any());
    }

    @Test
    void listWithVisibilityNarrowsTheQuery() {
        var pageable = PageRequest.of(0, 20);
        when(images.findBySiteAndVisible(SITE, false, pageable)).thenReturn(Page.empty());

        service.list(SITE, false, pageable);

        verify(images).findBySiteAndVisible(SITE, false, pageable);
        verify(images, never()).findBySite(any(), any());
    }

    @Test
    void deleteOfAnUnknownOrForeignIdIsA404AndTouchesNoFile() {
        when(images.findLockedByIdAndSite(ID, SITE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(ID, SITE))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verify(images, never()).delete(any());
        verify(storage, never()).delete(any(), any());
    }

    @Test
    void correctDeleteRemovesMetadataAndFiles() {
        var image = new Image(ID, SITE, true);
        when(images.findLockedByIdAndSite(ID, SITE)).thenReturn(Optional.of(image));

        service.delete(ID, SITE);

        verify(images).delete(image);
        verify(storage).delete(AssetKind.IMAGE, ID);
    }

    @Test
    void missingVariantIsA404Problem() {
        when(images.findByIdAndSite(ID, SITE)).thenReturn(Optional.of(new Image(ID, SITE, true)));
        when(variants.findByImageIdAndSize(ID, ImageSize.XL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.content(ID, SITE, "xl"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(exception.getReason()).isEqualTo("Variant is unavailable");
                });
    }

    @Test
    void publicContentOnlyLooksUpVisibleImages() {
        var image = new Image(ID, SITE, true);
        var variant = variant(image);
        when(images.findByIdAndVisibleTrue(ID)).thenReturn(Optional.of(image));
        when(variants.findByImageIdAndSize(ID, ImageSize.XL)).thenReturn(Optional.of(variant));
        when(storage.file(AssetKind.IMAGE, ID, "xl.jpg")).thenReturn(Path.of("media", "xl.jpg"));

        AssetContent content = service.content(ID, null, "xl");

        verify(images).findByIdAndVisibleTrue(ID);
        verify(images, never()).findByIdAndSite(any(), any());
        assertThat(content.contentType()).isEqualTo("image/jpeg");
        assertThat(content.bytes()).isEqualTo(3);
    }

    @Test
    void publicContentRejectsTheMasterSize() {
        when(images.findByIdAndVisibleTrue(ID)).thenReturn(Optional.of(new Image(ID, SITE, true)));

        assertThatThrownBy(() -> service.content(ID, null, "master"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        verifyNoInteractions(variants);
    }

    @Test
    void internalContentLooksUpTheImageForTheSite() {
        var image = new Image(ID, SITE, true);
        when(images.findByIdAndSite(ID, SITE)).thenReturn(Optional.of(image));
        when(variants.findByImageIdAndSize(ID, ImageSize.XL)).thenReturn(Optional.of(variant(image)));
        when(storage.file(any(), any(), any())).thenReturn(Path.of("media", "xl.jpg"));

        service.content(ID, SITE, "xl");

        verify(images).findByIdAndSite(ID, SITE);
        verify(images, never()).findByIdAndVisibleTrue(any());
    }

    @Test
    void uploadOfExactlyTheSizeLimitIsAccepted() throws Exception {
        var file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        var upload = mock(BlobStorage.Upload.class);
        when(upload.directory()).thenReturn(Path.of("staging", ID.toString()));
        var staged = upload.directory().resolve("upload");
        when(storage.stage(any())).thenReturn(upload);
        when(storage.upload(any(), any(), anyLong())).thenReturn(staged);
        when(processor.process(any(), any())).thenReturn(List.of());
        when(images.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(SITE, new ImageCreateRequest(true), file);

        verify(storage).upload(any(), any(), anyLong());
        verify(images).saveAndFlush(any());
    }

    @Test
    void oversizedUploadIsRejectedBeforeStaging() throws Exception {
        var file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1025L);

        assertThatThrownBy(() -> service.create(SITE, new ImageCreateRequest(true), file))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONTENT_TOO_LARGE));

        verifyNoInteractions(storage, processor, images, variants);
    }

    @Test
    void createKeepsPublishedFilesWhenTheMetadataCommitFails() throws Exception {
        var file = new MockMultipartFile("file", "upload", "image/jpeg", new byte[]{1, 2, 3});
        var upload = mock(BlobStorage.Upload.class);
        when(upload.id()).thenReturn(ID);
        when(upload.directory()).thenReturn(Path.of("staging", ID.toString()));
        when(storage.stage(any())).thenReturn(upload);
        var staged = upload.directory().resolve("upload");
        when(storage.upload(any(), any(), anyLong())).thenReturn(staged);
        when(processor.process(any(), any())).thenReturn(List.of(new ImageRendition(ImageSize.MASTER,
                ImageFormat.JPEG, 4, 2, new StoredFile("master.jpg", "image/jpeg", 3, "abc"))));
        when(images.saveAndFlush(any())).thenThrow(new IllegalStateException("commit failed"));

        assertThatThrownBy(() -> service.create(SITE, new ImageCreateRequest(true), file))
                .isInstanceOf(IllegalStateException.class).hasMessage("commit failed");

        verify(storage).publish(upload, AssetKind.IMAGE);
        verify(upload).close();
        // Published files stay behind for the orphan sweep to reconcile the failed commit.
        verify(storage, never()).delete(any(), any());
    }

    private static ImageVariant variant(Image image) {
        return new ImageVariant(image, new ImageRendition(ImageSize.XL, ImageFormat.JPEG, 4, 2,
                new StoredFile("xl.jpg", "image/jpeg", 3, "abc")));
    }
}
