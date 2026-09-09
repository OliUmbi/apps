package ch.oliumbi.messaging.services.delivery;

import ch.oliumbi.messaging.data.requests.MessageCreateRequest;
import ch.oliumbi.messaging.domain.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Validator;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmailDelivery {

    private final JavaMailSender mailSender;
    private final Validator validator;

    public EmailDelivery(JavaMailSender mailSender, Validator validator) {
        this.mailSender = mailSender;
        this.validator = validator;
    }

    public DeliveryResult send(DeliveryClaim claim) {
        var rejection = validate(claim);
        if (rejection.isPresent()) {
            return rejection.get();
        }
        try {
            mailSender.send(prepare(claim));
            return new DeliveryResult.Sent();
        } catch (Exception exception) {
            return failure(exception);
        }
    }

    private Optional<DeliveryResult.Rejected> validate(DeliveryClaim claim) {
        var violations = validator.validate(MessageCreateRequest.fromClaim(claim));
        if (violations.isEmpty()) {
            return Optional.empty();
        }
        var fields = violations.stream()
                .map(violation -> violation.getPropertyPath().toString())
                .distinct()
                .sorted()
                .collect(Collectors.joining(", "));
        return Optional.of(rejected("INVALID_REQUEST", "Invalid fields: " + fields));
    }

    private MimeMessage prepare(DeliveryClaim claim) throws MessagingException {
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
        return message;
    }

    private DeliveryResult failure(Exception exception) {
        return switch (exception) {
            case MailAuthenticationException ignored ->
                    rejected("SMTP_AUTHENTICATION_FAILED", "Check the SMTP credentials.");
            case MailParseException ignored ->
                    rejected("INVALID_MESSAGE", "The email could not be parsed.");
            case MailPreparationException ignored ->
                    rejected("INVALID_MESSAGE", "The email could not be prepared.");
            case IllegalArgumentException ignored ->
                    rejected("INVALID_MESSAGE", "The email contains invalid values.");
            case MailException ignored ->
                    new DeliveryResult.RetryableFailure(new FailureDetail(
                            "SMTP_DELIVERY_FAILED", "The SMTP server did not confirm delivery."));
            default ->
                    new DeliveryResult.RetryableFailure(new FailureDetail(
                            "DELIVERY_FAILED", "Delivery failed unexpectedly."));
        };
    }

    private DeliveryResult.Rejected rejected(String code, String message) {
        return new DeliveryResult.Rejected(new FailureDetail(code, message));
    }
}