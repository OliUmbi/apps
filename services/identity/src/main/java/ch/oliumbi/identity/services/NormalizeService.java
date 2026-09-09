package ch.oliumbi.identity.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class NormalizeService {

    public String normalizePermission(String permission) {
        if (permission == null || permission.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Permission is required");
        }
        return permission.trim();
    }

    public String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        return name.trim().toLowerCase(Locale.ROOT);
    }

    public String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-Mail is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
