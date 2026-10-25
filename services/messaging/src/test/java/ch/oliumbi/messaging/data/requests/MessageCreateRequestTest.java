package ch.oliumbi.messaging.data.requests;

import ch.oliumbi.messaging.domain.DeliveryClaim;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class MessageCreateRequestTest {

    private static final DeliveryClaim CLAIM = new DeliveryClaim(
            UUID.fromString("11111111-2222-3333-4444-555555555555"), 1,
            "zelglihof", "email",
            "hof@zelglihof.ch", "visitor@example.com", null,
            "Neue Hofanfrage", "details", "<p>details</p>");

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private Set<String> violations(DeliveryClaim claim) {
        return validator.validate(MessageCreateRequest.fromClaim(claim)).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    private DeliveryClaim claim(String type, String subject, String text, String html) {
        return new DeliveryClaim(CLAIM.messageId(), CLAIM.attempt(), CLAIM.site(), type,
                CLAIM.sender(), CLAIM.recipient(), CLAIM.replyTo(), subject, text, html);
    }

    @Test
    void acceptsAWellFormedRequest() {
        assertThat(violations(CLAIM)).isEmpty();
    }

    @Test
    void rejectsSubjectLineBreaks() {
        assertThat(violations(claim(CLAIM.type(), "Hi\r\nReply-To: attacker@evil.com", CLAIM.text(), null)))
                .containsExactly("subject");
        assertThat(violations(claim(CLAIM.type(), "Hi\nBcc: attacker@evil.com", CLAIM.text(), null)))
                .containsExactly("subject");
    }

    @Test
    void rejectsOversizedFields() {
        assertThat(violations(claim(CLAIM.type(), "s".repeat(201), CLAIM.text(), null)))
                .containsExactly("subject");
        assertThat(violations(claim(CLAIM.type(), CLAIM.subject(), "t".repeat(65537), null)))
                .containsExactly("text");
        assertThat(violations(claim(CLAIM.type(), CLAIM.subject(), CLAIM.text(), "h".repeat(262145))))
                .containsExactly("html");
    }

    @Test
    void rejectsTypesOtherThanTheEmailLiteral() {
        assertThat(violations(claim("sms", CLAIM.subject(), CLAIM.text(), null)))
                .containsExactly("type");
        assertThat(violations(claim("Email", CLAIM.subject(), CLAIM.text(), null)))
                .containsExactly("type");
        assertThat(violations(claim("email ", CLAIM.subject(), CLAIM.text(), null)))
                .containsExactly("type");
    }
}
