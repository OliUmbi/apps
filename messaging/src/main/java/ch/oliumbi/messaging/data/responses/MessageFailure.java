package ch.oliumbi.messaging.data.responses;

public record MessageFailure(
        String code,
        String message,
        boolean retryable) {
}
