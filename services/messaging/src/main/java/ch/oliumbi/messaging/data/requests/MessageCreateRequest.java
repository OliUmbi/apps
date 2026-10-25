package ch.oliumbi.messaging.data.requests;

import ch.oliumbi.messaging.domain.DeliveryClaim;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MessageCreateRequest(
        @NotBlank String site,
        @NotBlank @Pattern(regexp = "\\Aemail\\z", message = "type must be 'email'") String type,
        @NotBlank @Email String sender,
        @NotBlank @Email String recipient,
        @Email String replyTo,
        // The subject is written verbatim into the MIME header; line breaks there would smuggle headers.
        @NotBlank @Pattern(regexp = "[^\\r\\n]*", message = "subject must not contain line breaks")
        @Size(max = 200) String subject,
        @NotBlank @Size(max = 65536) String text,
        @Size(max = 262144) String html) {

    public static MessageCreateRequest fromClaim(DeliveryClaim claim) {
        return new MessageCreateRequest(claim.site(), claim.type(), claim.sender(),
                claim.recipient(), claim.replyTo(), claim.subject(), claim.text(), claim.html());
    }
}
