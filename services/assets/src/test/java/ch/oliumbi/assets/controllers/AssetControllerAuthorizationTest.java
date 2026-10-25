package ch.oliumbi.assets.controllers;

import ch.oliumbi.assets.services.DocumentService;
import ch.oliumbi.assets.services.ImageService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * RS-D1: a missing Authorization header is a 401 problem detail, not a 400.
 */
class AssetControllerAuthorizationTest {

    private static final String TOKEN = "internal-token";

    private final ImageService images = mock(ImageService.class);
    private final DocumentService documents = mock(DocumentService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(
                    new ImageController(images, new BearerTokenVerifier(TOKEN), mock(ContentResponse.class)),
                    new DocumentController(documents, new BearerTokenVerifier(TOKEN), mock(ContentResponse.class)))
            .setControllerAdvice(new ApiExceptionHandler())
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
            .build();

    @Test
    void imageListWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/internal/images").param("site", "studio"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void imageListWithAWrongTokenIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/internal/images").param("site", "studio").header("Authorization", "Bearer wrong-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void imageListWithTheCorrectTokenReturnsThePage() throws Exception {
        when(images.list(any(), any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mvc.perform(get("/internal/images").param("site", "studio").header("Authorization", "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }

    @Test
    void documentListWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/internal/documents").param("site", "studio"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void documentListWithAWrongTokenIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/internal/documents").param("site", "studio").header("Authorization", "Bearer wrong-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void documentListWithTheCorrectTokenReturnsThePage() throws Exception {
        when(documents.list(any(), any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mvc.perform(get("/internal/documents").param("site", "studio").header("Authorization", "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }
}
