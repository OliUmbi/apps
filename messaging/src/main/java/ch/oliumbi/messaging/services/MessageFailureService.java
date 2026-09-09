package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageFailure;
import org.springframework.mail.*;
import org.springframework.stereotype.Service;

// todo not bad, but looks a bit messy
@Service
public class MessageFailureService {

    public MessageFailure classify(Exception exception) {
        if (exception instanceof MailAuthenticationException) {
            return new MessageFailure("SMTP_AUTHENTICATION_FAILED", "Check the SMTP credentials.", false);
        }
        if (exception instanceof MailParseException || exception instanceof MailPreparationException
                || exception instanceof IllegalArgumentException) {
            return new MessageFailure("INVALID_MESSAGE", "The email could not be prepared for delivery.", false);
        }
        if (exception instanceof MailException) {
            return new MessageFailure("SMTP_DELIVERY_FAILED", "The SMTP server did not confirm delivery.", true);
        }
        return new MessageFailure("DELIVERY_FAILED", "Delivery failed unexpectedly.", true);
    }

    public MessageFailure abandoned() {
        return new MessageFailure("DELIVERY_TIMEOUT", "The delivery lease expired; the outcome is unknown.", true);
    }
}
