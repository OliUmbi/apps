package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.domain.AssetContent;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ContentResponseTest {

    private static final Path FILE = Path.of("stored.jpg");
    private static final AssetContent IMAGE = new AssetContent(FILE, "image/jpeg", 123, "abc123", null);
    private static final AssetContent DOCUMENT = new AssetContent(FILE, "application/pdf", 123, "abc123", "guide.pdf");

    private final ContentResponse responses = new ContentResponse();

    private static ServletWebRequest request() {
        return new ServletWebRequest(new MockHttpServletRequest());
    }

    @Test
    void publicImageUsesTheImmutableSevenDayPolicy() {
        var response = responses.create(IMAGE, false, request());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        var headers = response.getHeaders();
        assertThat(headers.getCacheControl()).isEqualTo("public, max-age=604800, immutable, must-revalidate");
        assertThat(headers.getETag()).isEqualTo("\"abc123\"");
        assertThat(headers.getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(headers.getContentType()).isEqualTo(MediaType.IMAGE_JPEG);
        assertThat(headers.getContentLength()).isEqualTo(123);
        assertThat(headers.getVary()).isNullOrEmpty();
    }

    @Test
    void internalImageUsesTheShortPrivatePolicy() {
        var response = responses.create(IMAGE, true, request());

        var headers = response.getHeaders();
        assertThat(headers.getCacheControl()).isEqualTo("private, max-age=300, must-revalidate");
        assertThat(headers.getVary()).containsExactly(HttpHeaders.AUTHORIZATION);
    }

    @Test
    void publicDocumentDownloadsAreNotCachedLikeImages() {
        var response = responses.create(DOCUMENT, false, request());

        var headers = response.getHeaders();
        assertThat(headers.getCacheControl()).isEqualTo("public, no-cache");
        assertThat(headers.getContentDisposition().isAttachment()).isTrue();
        assertThat(headers.getContentDisposition().getFilename()).isEqualTo("guide.pdf");
    }

    @Test
    void internalDocumentDownloadsAreNeverStored() {
        var response = responses.create(DOCUMENT, true, request());

        var headers = response.getHeaders();
        assertThat(headers.getCacheControl()).isEqualTo("private, no-store");
        assertThat(headers.getVary()).containsExactly(HttpHeaders.AUTHORIZATION);
    }

    @Test
    void aMatchingValidatorTurnsTheResponseIntoNotModified() {
        var http = new MockHttpServletRequest();
        http.addHeader(HttpHeaders.IF_NONE_MATCH, "\"abc123\"");

        var response = responses.create(IMAGE, false, new ServletWebRequest(http));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_MODIFIED);
        assertThat(response.getHeaders().getETag()).isEqualTo("\"abc123\"");
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("public, max-age=604800, immutable, must-revalidate");
    }
}
