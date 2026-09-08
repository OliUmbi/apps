package ch.oliumbi.identity.data.responses;

public record SessionCreateRequest(
        String name,
        String password) {
}
