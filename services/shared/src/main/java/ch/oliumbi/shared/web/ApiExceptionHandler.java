package ch.oliumbi.shared.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail integrity(DataIntegrityViolationException exception) {
        return problem(HttpStatus.CONFLICT, "The change conflicts with a database constraint.", exception);
    }

    @ExceptionHandler(ConcurrencyFailureException.class)
    public ProblemDetail concurrency(ConcurrencyFailureException exception) {
        return problem(HttpStatus.CONFLICT, "A concurrent change prevented this operation. Try again.", exception);
    }

    @ExceptionHandler({TransientDataAccessException.class, DataAccessResourceFailureException.class})
    public ProblemDetail unavailable(Exception exception) {
        return problem(HttpStatus.SERVICE_UNAVAILABLE, "Storage is temporarily unavailable. Try again later.", exception);
    }

    @ExceptionHandler(PropertyReferenceException.class)
    public ProblemDetail invalidProperty(PropertyReferenceException exception) {
        return problem(HttpStatus.BAD_REQUEST, "An unknown property was requested.", exception);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception exception) {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "The request could not be completed.", exception);
    }

    /**
     * Framework-shaped problem details (including the ResponseStatusException failures that
     * arrive through ErrorResponseException) pass through here. The parent builds the body
     * from the exception's ErrorResponse contract first, so reason texts reach the response;
     * stamping afterwards only adds errorId and a log line without altering status or detail.
     */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception exception, Object body, HttpHeaders headers,
                                                             HttpStatusCode statusCode, WebRequest request) {
        var response = super.handleExceptionInternal(exception, body, headers, statusCode, request);
        if (response != null && response.getBody() instanceof ProblemDetail problem
                && (problem.getProperties() == null || !problem.getProperties().containsKey("errorId"))) {
            stamp(problem, statusCode, exception);
        }
        return response;
    }

    /**
     * Adds field-level validation detail alongside the framework's existing problem body.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
                                                                  HttpHeaders headers, HttpStatusCode statusCode,
                                                                  WebRequest request) {
        var response = super.handleMethodArgumentNotValid(exception, headers, statusCode, request);
        if (response != null && response.getBody() instanceof ProblemDetail problem) {
            problem.setProperty("errors", exception.getBindingResult().getFieldErrors().stream()
                    .map(error -> Map.of("field", error.getField(), "message", error.getDefaultMessage()))
                    .toList());
        }
        return response;
    }

    private ProblemDetail problem(HttpStatus status, String detail, Exception exception) {
        var problem = ProblemDetail.forStatusAndDetail(status, detail);
        stamp(problem, status, exception);
        return problem;
    }

    private void stamp(ProblemDetail problem, HttpStatusCode statusCode, Exception exception) {
        var errorId = UUID.randomUUID().toString();
        problem.setProperty("errorId", errorId);

        var locations = Arrays.stream(exception.getStackTrace())
                .limit(12)
                .map(StackTraceElement::toString)
                .collect(Collectors.joining(" <- "));

        if (statusCode.is5xxServerError()) {
            log.error("Request failure {}: {} at {}", errorId, causes(exception), locations);
        } else {
            log.warn("Request conflict {}: {} at {}", errorId, causes(exception), locations);
        }
    }

    /**
     * Class names only: raw exception messages can carry request parameters or personal data.
     */
    private static String causes(Throwable exception) {
        var chain = new ArrayList<String>();
        for (var current = exception; current != null && chain.size() < 8; current = current.getCause()) {
            chain.add(current.getClass().getName());
        }
        return String.join(" <- ", chain);
    }
}
