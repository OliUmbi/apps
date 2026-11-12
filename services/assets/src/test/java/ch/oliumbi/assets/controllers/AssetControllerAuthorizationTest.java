package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.services.DocumentService;
import ch.oliumbi.assets.services.ImageService;
import ch.oliumbi.shared.security.BearerAuthorizationInterceptor;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * RS-D1: a missing Authorization header is a 401 problem detail, not a 400.
 */
class AssetControllerAuthorizationTest {

    private static final String TOKEN = "internal-token";
    private static final String DETAIL = "Missing or invalid internal bearer token";
    private static final String SITE = "studio";
    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");

    private final ImageService images = mock(ImageService.class);
    private final DocumentService documents = mock(DocumentService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(
                    new ImageController(images, new BearerTokenVerifier(TOKEN), mock(ContentResponse.class)),
                    new DocumentController(documents, new BearerTokenVerifier(TOKEN), mock(ContentResponse.class)))
            .setControllerAdvice(new ApiExceptionHandler())
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
            .addInterceptors(new BearerAuthorizationInterceptor(new BearerTokenVerifier(TOKEN)))
            .build();

    /**
     * One row per internal endpoint. The body is the JSON part for POST and the JSON
     * document for PATCH, so argument resolution succeeds and the authorization check runs.
     */
    private record InternalEndpoint(HttpMethod method, String path, String body) {
        @Override
        public String toString() {
            return method + " " + path;
        }
    }

    private static Stream<InternalEndpoint> internalEndpoints() {
        return Stream.of(
                new InternalEndpoint(HttpMethod.GET, "/internal/images", null),
                new InternalEndpoint(HttpMethod.POST, "/internal/images", "{\"visible\":true}"),
                new InternalEndpoint(HttpMethod.GET, "/internal/images/" + ID, null),
                new InternalEndpoint(HttpMethod.GET, "/internal/images/" + ID + "/content", null),
                new InternalEndpoint(HttpMethod.PATCH, "/internal/images/" + ID + "/visibility", "{\"visible\":false}"),
                new InternalEndpoint(HttpMethod.DELETE, "/internal/images/" + ID, null),
                new InternalEndpoint(HttpMethod.GET, "/internal/documents", null),
                new InternalEndpoint(HttpMethod.POST, "/internal/documents", "{\"slug\":\"guide\",\"visible\":true}"),
                new InternalEndpoint(HttpMethod.GET, "/internal/documents/" + ID, null),
                new InternalEndpoint(HttpMethod.GET, "/internal/documents/" + ID + "/content", null),
                new InternalEndpoint(HttpMethod.PATCH, "/internal/documents/" + ID + "/visibility", "{\"visible\":false}"),
                new InternalEndpoint(HttpMethod.DELETE, "/internal/documents/" + ID, null));
    }

    private static RequestBuilder endpointRequest(InternalEndpoint endpoint, String authorization) {
        if (endpoint.method().equals(HttpMethod.POST)) {
            var upload = multipart(HttpMethod.POST, endpoint.path())
                    .part(new MockPart("metadata", null,
                            endpoint.body().getBytes(StandardCharsets.UTF_8), MediaType.APPLICATION_JSON))
                    .file(new MockMultipartFile("file", "upload.bin",
                            MediaType.APPLICATION_OCTET_STREAM_VALUE, new byte[]{1, 2, 3}))
                    .param("site", SITE);
            if (authorization != null) upload.header(HttpHeaders.AUTHORIZATION, authorization);
            return upload;
        }

        var builder = request(endpoint.method(), endpoint.path()).param("site", SITE);
        if (endpoint.body() != null) {
            builder.contentType(MediaType.APPLICATION_JSON).content(endpoint.body());
        }
        if (authorization != null) builder.header(HttpHeaders.AUTHORIZATION, authorization);
        return builder;
    }

    @Test
    void aMalformedBodyWithoutABearerIsStillA401() throws Exception {
        mvc.perform(patch("/internal/images/" + ID + "/visibility")
                        .param("site", SITE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("not-json"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value(DETAIL));
    }

    @ParameterizedTest(name = "{0} without Authorization is a 401 problem detail")
    @MethodSource("internalEndpoints")
    void missingAuthorizationIsA401ProblemDetail(InternalEndpoint endpoint) throws Exception {
        mvc.perform(endpointRequest(endpoint, null))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value(DETAIL));
    }

    @ParameterizedTest(name = "{0} with a wrong token is a 401 problem detail")
    @MethodSource("internalEndpoints")
    void invalidAuthorizationIsA401ProblemDetail(InternalEndpoint endpoint) throws Exception {
        mvc.perform(endpointRequest(endpoint, "Bearer wrong-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value(DETAIL));
    }

    @Test
    void imageListWithTheCorrectTokenReturnsThePage() throws Exception {
        when(images.list(any(), any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mvc.perform(request(HttpMethod.GET, "/internal/images").param("site", SITE)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }

    @Test
    void documentListWithTheCorrectTokenReturnsThePage() throws Exception {
        when(documents.list(any(), any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mvc.perform(request(HttpMethod.GET, "/internal/documents").param("site", SITE)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }
}
