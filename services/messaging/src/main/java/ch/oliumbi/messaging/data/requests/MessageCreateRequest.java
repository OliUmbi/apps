package ch.oliumbi.messaging.data.requests;

import ch.oliumbi.messaging.domain.DeliveryClaim;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MessageCreateRequest(
        @NotBlank String site,
        @NotBlank @Pattern(regexp = "email") String type,
        @NotBlank @Email String sender,
        @NotBlank @Email String recipient,
        @NotBlank String subject,
        @NotBlank String text,
        String html) {

    public static MessageCreateRequest fromClaim(DeliveryClaim claim) {
        return new MessageCreateRequest(claim.site(), claim.type(), claim.sender(),
                claim.recipient(), claim.subject(), claim.text(), claim.html());
    }
}
