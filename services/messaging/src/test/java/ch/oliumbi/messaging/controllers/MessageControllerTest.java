package ch.oliumbi.messaging.controllers;

import ch.oliumbi.messaging.services.MessageService;
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
class MessageControllerTest {

    private static final String TOKEN = "internal-token";

    private final MessageService messageService = mock(MessageService.class);
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new MessageController(messageService, new BearerTokenVerifier(TOKEN)))
            .setControllerAdvice(new ApiExceptionHandler())
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
            .build();

    @Test
    void historyWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/message"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void historyWithAWrongTokenIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/message").header("Authorization", "Bearer wrong-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void historyWithTheCorrectTokenReturnsThePage() throws Exception {
        when(messageService.history(any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        mvc.perform(get("/message").header("Authorization", "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }
}
