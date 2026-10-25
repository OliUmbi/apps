package ch.oliumbi.identity.controllers;

import ch.oliumbi.identity.services.PermissionService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PermissionControllerTest {

    private static final String TOKEN = "internal-token";
    private static final UUID ACCOUNT_ID = UUID.randomUUID();

    private final PermissionService permissionService = mock(PermissionService.class);
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new PermissionController(permissionService, new BearerTokenVerifier(TOKEN)))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();

    @Test
    void grantWithoutAuthorizationIsA401ProblemDetail() throws Exception {
        mvc.perform(put("/account/" + ACCOUNT_ID + "/permission")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"permission\":\"studio.admin\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.detail").value("Missing or invalid internal bearer token"));
    }

    @Test
    void grantWithTheCorrectTokenIsNoContent() throws Exception {
        mvc.perform(put("/account/" + ACCOUNT_ID + "/permission").header("Authorization", "Bearer " + TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"permission\":\"studio.admin\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void oversizedPermissionIsA400WithFieldLevelErrors() throws Exception {
        var body = "{\"permission\":\"" + "p".repeat(300) + "\"}";

        mvc.perform(put("/account/" + ACCOUNT_ID + "/permission").header("Authorization", "Bearer " + TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.errors[0].field").value("permission"))
                .andExpect(jsonPath("$.errors[0].message").isString());
    }
}
