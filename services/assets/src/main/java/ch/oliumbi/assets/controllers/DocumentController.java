package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.data.requests.DocumentCreateRequest;
import ch.oliumbi.assets.data.requests.VisibilityRequest;
import ch.oliumbi.assets.data.responses.DocumentResponse;
import ch.oliumbi.assets.services.DocumentService;
import ch.oliumbi.assets.services.InternalAuthorizationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
public class DocumentController {
    private final DocumentService service;
    private final InternalAuthorizationService authorization;
    private final ContentResponse contentResponse;

    public DocumentController(DocumentService service, InternalAuthorizationService authorization, ContentResponse contentResponse) {
        this.service = service;
        this.authorization = authorization;
        this.contentResponse = contentResponse;
    }

    @GetMapping("/documents/{slug}")
    @SecurityRequirements
    public ResponseEntity<Resource> publicContent(@PathVariable String slug, WebRequest webRequest) {
        return contentResponse.create(service.publicContent(slug), false, webRequest);
    }

    @GetMapping("/internal/documents")
    public PagedModel<DocumentResponse> list(@RequestHeader(HttpHeaders.AUTHORIZATION) String token,
                                             @RequestParam @NotBlank @Size(max = 100) String site, @RequestParam(required = false) Boolean visible,
                                             @SortDefault(sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        authorization.requireValid(token);
        return new PagedModel<>(service.list(site, visible, pageable));
    }

    @PostMapping(value = "/internal/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse create(@RequestHeader(HttpHeaders.AUTHORIZATION) String token,
                                   @RequestParam @NotBlank @Size(max = 100) String site,
                                   @Valid @RequestPart("metadata") DocumentCreateRequest metadata,
                                   @RequestPart("file") MultipartFile file) throws IOException {
        authorization.requireValid(token);
        return service.create(site, metadata, file);
    }

    @GetMapping("/internal/documents/{id}")
    public DocumentResponse get(@RequestHeader(HttpHeaders.AUTHORIZATION) String token, @PathVariable UUID id,
                                @RequestParam @NotBlank @Size(max = 100) String site) {
        authorization.requireValid(token);
        return service.get(id, site);
    }

    @GetMapping("/internal/documents/{id}/content")
    public ResponseEntity<Resource> content(@RequestHeader(HttpHeaders.AUTHORIZATION) String token,
                                            @PathVariable UUID id, @RequestParam @NotBlank @Size(max = 100) String site,
                                            WebRequest webRequest) {
        authorization.requireValid(token);
        return contentResponse.create(service.content(id, site), true, webRequest);
    }

    @PatchMapping("/internal/documents/{id}/visibility")
    public DocumentResponse visibility(@RequestHeader(HttpHeaders.AUTHORIZATION) String token,
                                       @PathVariable UUID id, @RequestParam @NotBlank @Size(max = 100) String site,
                                       @Valid @RequestBody VisibilityRequest request) {
        authorization.requireValid(token);
        return service.visibility(id, site, request);
    }

    @DeleteMapping("/internal/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(HttpHeaders.AUTHORIZATION) String token, @PathVariable UUID id,
                       @RequestParam @NotBlank @Size(max = 100) String site) {
        authorization.requireValid(token);
        service.delete(id, site);
    }
}
