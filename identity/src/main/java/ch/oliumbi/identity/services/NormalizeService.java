package ch.oliumbi.identity.services;

import org.springframework.stereotype.Service;

@Service
public class NormalizeService {

    public String normalizeName(String username) {
        return username.trim().toLowerCase();
    }
}
