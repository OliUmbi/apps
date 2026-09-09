package ch.oliumbi.messaging.data.requests;

import jakarta.validation.constraints.*;


public record MessageCreateRequest(
        @NotBlank String site,
        @NotBlank @Pattern(regexp = "email") String type,
        @NotBlank @Email String sender,
        @NotBlank @Email String recipient,
        @NotBlank String subject,
        @NotBlank String text,
        String html) {
}
