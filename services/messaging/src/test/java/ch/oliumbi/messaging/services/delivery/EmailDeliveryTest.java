package ch.oliumbi.messaging.services.delivery;

import ch.oliumbi.messaging.domain.DeliveryClaim;
import ch.oliumbi.messaging.domain.DeliveryResult;
import ch.oliumbi.messaging.domain.FailureDetail;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailDeliveryTest {

    private static final DeliveryClaim CLAIM = new DeliveryClaim(
            UUID.fromString("11111111-2222-3333-4444-555555555555"), 1,
            "zelglihof", "email",
            "hof@zelglihof.ch", "visitor@example.com", "visitor@example.com",
            "Neue Hofanfrage", "details", "<p>details</p>");

    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final EmailDelivery delivery =
            new EmailDelivery(mailSender, Validation.buildDefaultValidatorFactory().getValidator());

    @BeforeEach
    void mimeMessages() {
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage((Session) null));
    }

    @Test
    void sendsEnvelopeSubjectAndBothBodies() throws Exception {
        var result = delivery.send(CLAIM);

        assertThat(result).isInstanceOf(DeliveryResult.Sent.class);
        var message = sent();
        assertThat(message.getFrom()).singleElement()
                .extracting(address -> ((jakarta.mail.internet.InternetAddress) address).getAddress())
                .isEqualTo("hof@zelglihof.ch");
        assertThat(message.getAllRecipients()).singleElement()
                .extracting(address -> ((jakarta.mail.internet.InternetAddress) address).getAddress())
                .isEqualTo("visitor@example.com");
        assertThat(message.getHeader("Reply-To", null)).isEqualTo("visitor@example.com");
        assertThat(message.getSubject()).isEqualTo("Neue Hofanfrage");
        assertThat(bodies(message)).containsExactlyInAnyOrder(CLAIM.text(), CLAIM.html());
    }

    @Test
    void sendsPlainTextWithoutReplyToWhenAbsent() throws Exception {
        var claim = new DeliveryClaim(CLAIM.messageId(), CLAIM.attempt(), CLAIM.site(), CLAIM.type(),
                CLAIM.sender(), CLAIM.recipient(), null, CLAIM.subject(), CLAIM.text(), null);

        delivery.send(claim);

        var message = sent();
        assertThat(message.getHeader("Reply-To", null)).isNull();
        assertThat(bodies(message)).containsExactly(CLAIM.text());
    }

    @Test
    void rejectsAnInvalidEnvelopeWithoutTalkingToSmtp() {
        var claim = new DeliveryClaim(CLAIM.messageId(), CLAIM.attempt(), CLAIM.site(), CLAIM.type(),
                "not-an-email", CLAIM.recipient(), null, CLAIM.subject(), CLAIM.text(), null);

        var result = delivery.send(claim);

        assertThat(result).isInstanceOf(DeliveryResult.Rejected.class);
        var detail = ((DeliveryResult.Rejected) result).detail();
        assertThat(detail.code()).isEqualTo("INVALID_REQUEST");
        assertThat(detail.message()).contains("sender");
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void mapsAuthenticationProblemsToARejection() {
        doThrow(new MailAuthenticationException("bad credentials")).when(mailSender).send(any(MimeMessage.class));

        var result = delivery.send(CLAIM);

        assertThat(result).isInstanceOf(DeliveryResult.Rejected.class);
        assertThat(((DeliveryResult.Rejected) result).detail().code()).isEqualTo("SMTP_AUTHENTICATION_FAILED");
    }

    @Test
    void mapsSmtpProblemsToARetryableFailure() {
        doThrow(new MailSendException("not confirmed")).when(mailSender).send(any(MimeMessage.class));

        var result = delivery.send(CLAIM);

        assertThat(result).isInstanceOf(DeliveryResult.RetryableFailure.class);
        assertThat(((DeliveryResult.RetryableFailure) result).detail().code()).isEqualTo("SMTP_DELIVERY_FAILED");
    }

    @Test
    void mapsUnexpectedProblemsToARetryableFailure() {
        doThrow(new IllegalStateException("boom")).when(mailSender).send(any(MimeMessage.class));

        var result = delivery.send(CLAIM);

        assertThat(result).isInstanceOf(DeliveryResult.RetryableFailure.class);
        assertThat(((DeliveryResult.RetryableFailure) result).detail().code()).isEqualTo("DELIVERY_FAILED");
    }

    private MimeMessage sent() throws Exception {
        var captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        return captor.getValue();
    }

    /** Walks the MIME tree and returns the decoded text bodies. */
    private List<String> bodies(MimeMessage message) throws Exception {
        return collect(message.getContent());
    }

    private List<String> collect(Object content) throws Exception {
        if (content instanceof MimeMultipart multipart) {
            var bodies = new java.util.ArrayList<String>();
            for (var index = 0; index < multipart.getCount(); index++) {
                bodies.addAll(collect(multipart.getBodyPart(index).getContent()));
            }
            return bodies;
        }
        return List.of(content.toString());
    }
}
