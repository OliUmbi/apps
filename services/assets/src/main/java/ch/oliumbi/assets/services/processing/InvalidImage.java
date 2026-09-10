package ch.oliumbi.assets.services.processing;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class InvalidImage extends ResponseStatusException {
    InvalidImage(String message) {
        super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
    }

    InvalidImage(String message, Throwable cause) {
        super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message, cause);
    }
}
