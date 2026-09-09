package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.domain.AssetContent;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

@Component
public class ContentResponse {
    public ResponseEntity<Resource> create(AssetContent content, boolean internal, WebRequest request) {
        boolean document = content.downloadName() != null;
        String cache = document
                ? (internal ? "private, no-store" : "public, no-cache")
                : (internal ? "private, max-age=300, must-revalidate" : "public, max-age=604800, immutable, must-revalidate");
        var headers = new HttpHeaders();
        headers.setCacheControl(cache);
        headers.setETag('"' + content.checksum() + '"');
        headers.set("X-Content-Type-Options", "nosniff");
        if (internal) headers.setVary(java.util.List.of(HttpHeaders.AUTHORIZATION));
        // Callers have already checked existence, site and visibility before conditional handling.
        if (request.checkNotModified(headers.getETag())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }
        headers.setContentType(MediaType.parseMediaType(content.contentType()));
        headers.setContentLength(content.bytes());
        if (document)
            headers.setContentDisposition(ContentDisposition.attachment().filename(content.downloadName()).build());
        return ResponseEntity.ok().headers(headers).body(new FileSystemResource(content.path()));
    }
}
