package ch.oliumbi.assets.services;

import ch.oliumbi.assets.configurations.AssetsProperties;
import ch.oliumbi.assets.data.entites.Document;
import ch.oliumbi.assets.data.requests.DocumentCreateRequest;
import ch.oliumbi.assets.data.requests.VisibilityRequest;
import ch.oliumbi.assets.data.responses.DocumentResponse;
import ch.oliumbi.assets.domain.AssetContent;
import ch.oliumbi.assets.domain.AssetKind;
import ch.oliumbi.assets.repositories.DocumentRepository;
import ch.oliumbi.assets.services.storage.BlobStorage;
import ch.oliumbi.assets.services.storage.FileInspection;
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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.UUID;

@Slf4j
@Service
public class DocumentService {
    private final DocumentRepository documents;
    private final BlobStorage storage;
    private final AssetsProperties properties;
    private final TransactionTemplate transactions;

    public DocumentService(DocumentRepository documents, BlobStorage storage, AssetsProperties properties,
                           PlatformTransactionManager transactionManager) {
        this.documents = documents;
        this.storage = storage;
        this.properties = properties;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    public DocumentResponse create(String site, DocumentCreateRequest request, MultipartFile file) throws IOException {
        var id = UUID.randomUUID();
        try (var upload = storage.stage(id)) {
            var input = storage.upload(upload, file.getInputStream(), properties.documentMaxBytes());
            try (var stream = Files.newInputStream(input)) {
                var signature = new String(stream.readNBytes(5), StandardCharsets.US_ASCII);
                if (!signature.equals("%PDF-"))
                    throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF documents are supported");
            }
            var output = upload.directory().resolve("original.pdf");
            Files.move(input, output);
            var stored = FileInspection.inspect(output, "application/pdf");
            storage.publish(upload, AssetKind.DOCUMENT);
            return transactions.execute(status -> DocumentResponse.fromDocument(documents.saveAndFlush(
                    new Document(id, site, request.visible(), request.slug(), request.slug() + ".pdf", stored.bytes(), stored.checksum()))));
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> list(String site, Boolean visible, Pageable pageable) {
        var page = visible == null ? documents.findBySite(site, pageable) : documents.findBySiteAndVisible(site, visible, pageable);
        return page.map(DocumentResponse::fromDocument);
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UUID id, String site) {
        return DocumentResponse.fromDocument(documents.findByIdAndSite(id, site)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    public AssetContent content(UUID id, String site) {
        return content(documents.findByIdAndSite(id, site).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional(readOnly = true)
    public AssetContent publicContent(String slug) {
        return content(documents.findBySlugAndVisibleTrue(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    private AssetContent content(Document document) {
        return new AssetContent(storage.file(AssetKind.DOCUMENT, document.getId(), "original.pdf"), "application/pdf",
                document.getByteCount(), document.getChecksum(), document.getFilename());
    }

    @Transactional
    public DocumentResponse visibility(UUID id, String site, VisibilityRequest request) {
        var document = documents.findLockedByIdAndSite(id, site).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        document.setVisible(request.visible());
        documents.flush();
        return DocumentResponse.fromDocument(document);
    }

    public void delete(UUID id, String site) {
        boolean deleted = Boolean.TRUE.equals(transactions.execute(status -> {
            var asset = documents.findLockedByIdAndSite(id, site);
            if (asset.isEmpty()) return false;
            documents.delete(asset.get());
            return true;
        }));
        if (!deleted) return;
        try {
            storage.delete(AssetKind.DOCUMENT, id);
        } catch (RuntimeException exception) {
            log.warn("Document {} file deletion deferred to cleanup ({})", id, exception.getClass().getSimpleName());
        }
    }
}
