package ch.oliumbi.messaging.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.sql.SQLException;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    // todo again same as in identity
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail integrity(DataIntegrityViolationException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof SQLException sqlException && "23505".equals(sqlException.getSQLState())) {
                return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "A record with these unique values already exists.");
            }
            cause = cause.getCause();
        }
        return unexpected(exception);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception exception) {
        // Do not expose SQL parameters, passwords, tokens or message contents.
        log.error("Request failed ({})", exception.getClass().getSimpleName());
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "The request could not be completed.");
    }
}
