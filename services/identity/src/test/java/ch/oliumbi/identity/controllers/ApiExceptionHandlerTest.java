package ch.oliumbi.identity.controllers;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import ch.oliumbi.shared.web.ApiExceptionHandler;
import com.jayway.jsonpath.JsonPath;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the shared error envelope: every problem response carries errorId (RS-D2),
 * status and detail texts survive untouched, and logs hold the class-name cause chain
 * without raw exception messages (RS-D3).
 */
class ApiExceptionHandlerTest {

    record ProbeRequest(@Size(max = 3) String name) {
    }

    @Controller
    static class ProbeController {

        @GetMapping("/unauthorized")
        public void unauthorized() {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        @GetMapping("/missing")
        public void missing() {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account is unknown");
        }

        @GetMapping("/conflict")
        public void conflict() {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name or email already in use");
        }

        @GetMapping("/unexpected")
        public void unexpected() {
            throw new IllegalStateException("outer-secret", new IllegalArgumentException("inner-secret"));
        }

        @PostMapping("/valid")
        public void valid(@Valid @RequestBody ProbeRequest request) {
        }
    }

    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ProbeController())
            .setControllerAdvice(new ApiExceptionHandler())
            .build();

    @Test
    void responseStatusProblemsCarryErrorIdAndKeepStatusAndDetail() throws Exception {
        mvc.perform(get("/unauthorized"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.errorId").isString());

        mvc.perform(get("/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").value("Account is unknown"))
                .andExpect(jsonPath("$.errorId").isString());

        mvc.perform(get("/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detail").value("Name or email already in use"))
                .andExpect(jsonPath("$.errorId").isString());
    }

    @Test
    void validationProblemsCarryFieldLevelErrors() throws Exception {
        mvc.perform(post("/valid").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"toolong\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorId").isString())
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].message").isString());
    }

    @Test
    void conflictsAreLoggedWithTheirErrorId() throws Exception {
        var appender = attach();

        try {
            var body = mvc.perform(get("/conflict")).andReturn().getResponse().getContentAsString();
            var errorId = JsonPath.read(body, "$.errorId").toString();

            assertThat(appender.list)
                    .anyMatch(event -> event.getFormattedMessage().contains("Request conflict")
                            && event.getFormattedMessage().contains(errorId));
        } finally {
            detach(appender);
        }
    }

    @Test
    void causeChainsAreLoggedAsClassNamesWithoutRawMessages() throws Exception {
        var appender = attach();

        try {
            mvc.perform(get("/unexpected")).andExpect(status().isInternalServerError());

            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .anyMatch(message -> message.contains("java.lang.IllegalStateException")
                            && message.contains("java.lang.IllegalArgumentException")
                            && !message.contains("outer-secret")
                            && !message.contains("inner-secret"));
        } finally {
            detach(appender);
        }
    }

    private ListAppender<ILoggingEvent> attach() {
        var appender = new ListAppender<ILoggingEvent>();
        appender.start();
        ((Logger) LoggerFactory.getLogger(ApiExceptionHandler.class)).addAppender(appender);
        return appender;
    }

    private void detach(ListAppender<ILoggingEvent> appender) {
        ((Logger) LoggerFactory.getLogger(ApiExceptionHandler.class)).detachAppender(appender);
        appender.stop();
    }
}
