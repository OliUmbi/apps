package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.data.responses.AccountResponse;
import ch.oliumbi.identity.services.AccountService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AccountControllerTest {

    private static final String TOKEN = "internal-token";

    private final AccountService accountService = mock(AccountService.class);
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new AccountController(accountService, new BearerTokenVerifier(TOKEN)))
            .setControllerAdvice(new ApiExceptionHandler())
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
            .build();

    @Test
    void listWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/account"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void listWithAWrongTokenIsA401ProblemDetail() throws Exception {
        mvc.perform(get("/account").header("Authorization", "Bearer wrong-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void listWithTheCorrectTokenReturnsThePageEnvelope() throws Exception {
        var response = new AccountResponse(UUID.randomUUID(), "alice", "alice@example.com", true,
                Instant.parse("2026-10-01T10:00:00Z"), Instant.parse("2026-10-01T10:00:00Z"));
        when(accountService.list(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(response)));

        mvc.perform(get("/account").header("Authorization", "Bearer " + TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("alice"))
                .andExpect(jsonPath("$.content[0].email").value("alice@example.com"))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void oversizedAccountInputIsA400WithFieldLevelErrors() throws Exception {
        var body = "{\"name\":\"" + "n".repeat(300) + "\",\"email\":\"" + "a".repeat(400) + "@example.com\",\"enabled\":true}";

        mvc.perform(put("/account/" + UUID.randomUUID()).header("Authorization", "Bearer " + TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.errors[?(@.field == 'name')]").isNotEmpty())
                .andExpect(jsonPath("$.errors[?(@.field == 'email')]").isNotEmpty());
    }
}
