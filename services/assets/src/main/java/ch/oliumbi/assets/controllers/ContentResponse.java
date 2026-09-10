package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.domain.AssetContent;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

import java.util.List;

// todo remove magic values
@Component
public class ContentResponse {

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
        headers.set("X-Content-Type-Options", "nosniff");
        if (internal) headers.setVary(List.of(HttpHeaders.AUTHORIZATION));
        return headers;
    }

    private String cachePolicy(boolean document, boolean internal) {
        if (document) return internal ? "private, no-store" : "public, no-cache";
        return internal
                ? "private, max-age=300, must-revalidate"
                : "public, max-age=604800, immutable, must-revalidate";
    }
}
