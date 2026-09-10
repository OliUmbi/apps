package ch.oliumbi.assets.services;

import ch.oliumbi.assets.configurations.ImageProperties;
import ch.oliumbi.assets.data.entites.Image;
import ch.oliumbi.assets.data.requests.ImageCreateRequest;
import ch.oliumbi.assets.data.requests.VisibilityRequest;
import ch.oliumbi.assets.data.responses.ImageDetailResponse;
import ch.oliumbi.assets.data.responses.ImageResponse;
import ch.oliumbi.assets.domain.*;
import ch.oliumbi.assets.repositories.ImageRepository;
import ch.oliumbi.assets.repositories.ImageVariantRepository;
import ch.oliumbi.assets.services.processing.ImageProcessor;
import ch.oliumbi.assets.services.storage.BlobStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
public class ImageService {
    private final ImageRepository images;
    private final ImageVariantRepository variants;
    private final BlobStorage storage;
    private final ImageProcessor processor;
    private final ImageProperties properties;
    private final TransactionTemplate transactions;

    public ImageService(ImageRepository images, ImageVariantRepository variants, BlobStorage storage,
                        ImageProcessor processor, ImageProperties properties, PlatformTransactionManager transactionManager) {
        this.images = images;
        this.variants = variants;
        this.storage = storage;
        this.processor = processor;
        this.properties = properties;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    public ImageDetailResponse create(String site, ImageCreateRequest request, MultipartFile file) throws IOException {
        var id = UUID.randomUUID();
        try (var upload = storage.stage(id)) {
            var input = storage.upload(upload, file.getInputStream(), properties.maxBytes());
            var renditions = processor.process(input, upload.directory());
            var image = new Image(id, site, request.visible());
            renditions.forEach(image::addVariant);
            storage.publish(upload, AssetKind.IMAGE);
            // Keep published files until cleanup can reconcile the database if commit fails.
            return transactions.execute(status -> ImageDetailResponse.fromImage(images.saveAndFlush(image)));
        }
    }

    @Transactional(readOnly = true)
    public Page<ImageResponse> list(String site, Boolean visible, Pageable pageable) {
        var page = visible == null ? images.findBySite(site, pageable) : images.findBySiteAndVisible(site, visible, pageable);
        return page.map(ImageResponse::fromImage);
    }

    @Transactional(readOnly = true)
    public ImageDetailResponse get(UUID id, String site) {
        return ImageDetailResponse.fromImage(images.findByIdAndSite(id, site)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    public AssetContent content(UUID id, String site, String size) {
        boolean internal = site != null;
        var image = (internal ? images.findByIdAndSite(id, site) : images.findByIdAndVisibleTrue(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var variant = variants.findByImageIdAndSize(image.getId(), ImageSize.parse(size, internal)).orElseThrow();
        return new AssetContent(storage.file(AssetKind.IMAGE, id, variant.getFileKey()), variant.getFormat().contentType(),
                variant.getByteCount(), variant.getChecksum(), null);
    }

    @Transactional
    public ImageResponse visibility(UUID id, String site, VisibilityRequest request) {
        var image = images.findLockedByIdAndSite(id, site)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        image.setVisible(request.visible());
        images.flush();
        return ImageResponse.fromImage(image);
    }

    // todo duplicated code in documentService, can probably be moved somewhere else
    public void delete(UUID id, String site) {

        boolean deleted = Boolean.TRUE.equals(transactions.execute(status -> {
            var asset = images.findLockedByIdAndSite(id, site);
            if (asset.isEmpty()) return false;
            images.delete(asset.get());
            return true;
        }));

        if (!deleted) {
            return;
        }

        try {
            storage.delete(AssetKind.IMAGE, id);
        } catch (RuntimeException exception) {
            log.warn("Image {} file deletion deferred to cleanup ({})", id, exception.getClass().getSimpleName());
        }
    }
}
