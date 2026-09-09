package ch.oliumbi.messaging.services.delivery;

import ch.oliumbi.messaging.data.requests.MessageCreateRequest;
import ch.oliumbi.messaging.domain.*;
import jakarta.validation.Validator;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

// this could should be split up and made more readable. keep it in the same file but try to reduce function length and complexity
@Service
public class SmtpEmailDelivery implements EmailDelivery {

    private final JavaMailSender mailSender;
    private final Validator validator;

    public SmtpEmailDelivery(JavaMailSender mailSender, Validator validator) {
        this.mailSender = mailSender;
        this.validator = validator;
    }

    @Override
    public DeliveryResult send(DeliveryClaim claim) {
        var violations = validator.validate(MessageCreateRequest.fromClaim(claim));
        if (!violations.isEmpty()) {
            var fields = violations.stream().map(violation -> violation.getPropertyPath().toString())
                    .distinct().sorted().collect(Collectors.joining(", "));
            return rejected("INVALID_REQUEST", "Invalid fields: " + fields);
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(claim.sender());
            helper.setTo(claim.recipient());
            helper.setSubject(claim.subject());
            if (claim.html() == null || claim.html().isBlank()) {
                helper.setText(claim.text());
            } else {
                helper.setText(claim.text(), claim.html());
            }
            mailSender.send(message);
            return new DeliveryResult.Sent();
        } catch (Exception exception) {
            return switch (exception) {
                case MailAuthenticationException ignored ->
                        rejected("SMTP_AUTHENTICATION_FAILED", "Check the SMTP credentials.");
                case MailParseException ignored -> rejected("INVALID_MESSAGE", "The email could not be parsed.");
                case MailPreparationException ignored ->
                        rejected("INVALID_MESSAGE", "The email could not be prepared.");
                case IllegalArgumentException ignored ->
                        rejected("INVALID_MESSAGE", "The email contains invalid values.");
                case MailException ignored ->
                        new DeliveryResult.RetryableFailure(new FailureDetail("SMTP_DELIVERY_FAILED", "The SMTP server did not confirm delivery."));
                default ->
                        new DeliveryResult.RetryableFailure(new FailureDetail("DELIVERY_FAILED", "Delivery failed unexpectedly."));
            };
        }
    }

    private DeliveryResult.Rejected rejected(String code, String message) {
        return new DeliveryResult.Rejected(new FailureDetail(code, message));
    }
}
