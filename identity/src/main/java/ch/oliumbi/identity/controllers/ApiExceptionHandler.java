package ch.oliumbi.identity.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.*;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;

// todo i like this setup and would like to move it into a shared lib if possible (would minimize potential errors at this critical point)
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
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "An unknown property was requested.");
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception exception) {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "The request could not be completed.", exception);
    }

    private ProblemDetail problem(HttpStatus status, String detail, Exception exception) {
        var errorId = UUID.randomUUID().toString();
        var problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setProperty("errorId", errorId);

        var locations = Arrays.stream(exception.getStackTrace())
                .limit(12)
                .map(StackTraceElement::toString)
                .collect(Collectors.joining(" <- "));

        if (status.is5xxServerError()) {
            log.error("Request failure {}: {} at {}", errorId, exception.getClass().getName(), locations);
        } else {
            log.warn("Request conflict {}: {} at {}", errorId, exception.getClass().getName(), locations);
        }
        return problem;
    }
}
