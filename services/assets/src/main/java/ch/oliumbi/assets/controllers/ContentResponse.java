package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.domain.AssetContent;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

@Component
public class ContentResponse {

    private static final String NO_SNIFF_HEADER = "X-Content-Type-Options";
    private static final String NO_SNIFF = "nosniff";
    private static final String PRIVATE_DOCUMENT_CACHE = "private, no-store";
    private static final String PUBLIC_DOCUMENT_CACHE = "public, no-cache";
    private static final String PRIVATE_IMAGE_CACHE = "private, max-age=300, must-revalidate";
    private static final String PUBLIC_IMAGE_CACHE = "public, max-age=604800, immutable, must-revalidate";

    public ResponseEntity<Resource> create(AssetContent content, boolean internal, WebRequest request) {
        var headers = cacheHeaders(content, internal);

        if (request.checkNotModified(headers.getETag())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }

        headers.setContentType(MediaType.parseMediaType(content.contentType()));
        headers.setContentLength(content.bytes());
        if (content.downloadName() != null) {
            headers.setContentDisposition(ContentDisposition.attachment().filename(content.downloadName()).build());
        }

        return ResponseEntity.ok().headers(headers).body(new FileSystemResource(content.path()));
    }

    private HttpHeaders cacheHeaders(AssetContent content, boolean internal) {
        var headers = new HttpHeaders();
        headers.setCacheControl(cachePolicy(content.downloadName() != null, internal));
        headers.setETag('"' + content.checksum() + '"');
        headers.set(NO_SNIFF_HEADER, NO_SNIFF);
        if (internal) headers.setVary(List.of(HttpHeaders.AUTHORIZATION));
        return headers;
    }

    private String cachePolicy(boolean document, boolean internal) {
        if (document) return internal ? PRIVATE_DOCUMENT_CACHE : PUBLIC_DOCUMENT_CACHE;
        return internal ? PRIVATE_IMAGE_CACHE : PUBLIC_IMAGE_CACHE;
    }
}
