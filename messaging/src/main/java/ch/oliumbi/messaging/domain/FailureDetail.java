package ch.oliumbi.messaging.domain;

public record FailureDetail(String code, String message) {

    public static FailureDetail abandoned() {
        return new FailureDetail("DELIVERY_TIMEOUT", "The delivery lease expired; the SMTP outcome is unknown.");
    }
}
