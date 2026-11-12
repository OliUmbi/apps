package ch.oliumbi.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BearerAuthorizationInterceptorTest {

    private final BearerAuthorizationInterceptor interceptor =
            new BearerAuthorizationInterceptor(new BearerTokenVerifier("secret-token"));

    @Test
    void acceptsAValidBearerBeforeTheHandlerRuns() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer secret-token");

        assertThat(interceptor.preHandle(request, new MockHttpServletResponse(), new Object())).isTrue();
    }

    @Test
    void rejectsAMissingBearerBeforeArgumentResolution() {
        assertThatThrownBy(() ->
                interceptor.preHandle(new MockHttpServletRequest(), new MockHttpServletResponse(), new Object()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Missing or invalid internal bearer token");
    }
}
