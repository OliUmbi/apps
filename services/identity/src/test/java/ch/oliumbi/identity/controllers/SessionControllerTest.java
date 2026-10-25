package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.configurations.IdentityProperties;
import ch.oliumbi.identity.repositories.AccountRepository;
import ch.oliumbi.identity.repositories.AccountSessionRepository;
import ch.oliumbi.identity.services.IdentityInputNormalizer;
import ch.oliumbi.identity.services.PasswordService;
import ch.oliumbi.identity.services.SessionService;
import ch.oliumbi.identity.services.TokenService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionControllerTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");
    private static final String TOKEN = "internal-token";

    private final AccountRepository accounts = mock(AccountRepository.class);
    private final AccountSessionRepository sessions = mock(AccountSessionRepository.class);
    private final SessionService sessionService = new SessionService(
            accounts, sessions, new IdentityInputNormalizer(), new TokenService(),
            Clock.fixed(NOW, ZoneOffset.UTC), mock(PasswordService.class),
            new IdentityProperties(TOKEN, 7, 30));
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new SessionController(sessionService, new BearerTokenVerifier(TOKEN)))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();

    @Test
    void revokeWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(post("/session/revoke")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"dead-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void revokeOfADeadTokenIsNoContent() throws Exception {
        mvc.perform(post("/session/revoke").header("Authorization", "Bearer " + TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"dead-token\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deadSessionTokensAndBadBearersReturnDistinct401ProblemDetails() throws Exception {
        when(sessions.findValidSession(any(), any())).thenReturn(Optional.empty());

        var bearer = mvc.perform(post("/session/validate").header("Authorization", "Bearer wrong-token")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"dead-token\"}"))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        var session = mvc.perform(post("/session/validate").header("Authorization", "Bearer " + TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"dead-token\"}"))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        Object bearerDetail = JsonPath.read(bearer, "$.detail");
        Object sessionDetail = JsonPath.read(session, "$.detail");
        Object bearerErrorId = JsonPath.read(bearer, "$.errorId");
        Object sessionErrorId = JsonPath.read(session, "$.errorId");
        assertThat(bearerDetail).isEqualTo("Missing or invalid internal bearer token");
        assertThat(sessionDetail).isEqualTo("Session token is expired, revoked or unknown");
        assertThat(bearerErrorId).isNotNull();
        assertThat(sessionErrorId).isNotNull();
    }
}
