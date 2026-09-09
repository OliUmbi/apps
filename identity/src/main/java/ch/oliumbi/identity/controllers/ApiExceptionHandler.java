package ch.oliumbi.identity.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.sql.SQLException;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    // todo i dislike the random string sqlstate code and overall i dislike the that only that specific error is handled.
    // todo this whole block should probably be more generic and also handle all exceptions. i think a DataIntegrityViolationException can and should be handled specifically but overall this should be more generic
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

    // todo good call to now log sensitive details but i believe we can do a bit better.
    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception exception) {
        // Do not expose SQL parameters, passwords, tokens or message contents.
        log.error("Request failed ({})", exception.getClass().getSimpleName());
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "The request could not be completed.");
    }
}
