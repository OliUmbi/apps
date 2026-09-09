package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageClaim;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

// todo i think the services package could be sorted into some subpackages where it makes sense to better see the actual externally facing interfaces
@Service
public class EmailDeliveryService implements MessageDelivery {

    private final JavaMailSender mailSender;

    public EmailDeliveryService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(MessageClaim message) throws Exception {
        if (!"email".equals(message.type())) {
            throw new IllegalArgumentException("Unsupported message type");
        }

        var mimeMessage = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(message.sender());
        helper.setTo(message.recipient());
        helper.setSubject(message.subject());

        if (message.html() == null || message.html().isBlank()) {
            helper.setText(message.text());
        } else {
            helper.setText(message.text(), message.html());
        }

        mailSender.send(mimeMessage);
    }
}
