package ch.oliumbi.messaging;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
class EmailDelivery {
    private final JavaMailSender mail;
    private final ObjectMapper json;
    private final String fromAddress;
    private final String fromName;

    EmailDelivery(
            JavaMailSender mail,
            ObjectMapper json,
            @Value("${messaging.from-address}") String fromAddress,
            @Value("${messaging.from-name}") String fromName) {
        this.mail = mail;
        this.json = json;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    void send(OutboxMessage message) throws Exception {
        JsonNode payload = json.readTree(message.payload());
        MimeMessage mime = mail.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom(fromAddress, fromName);
        helper.setTo(message.recipientEmail());

        switch (message.messageType()) {
            case "newsletter.confirmation" -> confirmation(helper, payload.path("confirmUrl").asText(), message.locale());
            case "newsletter.welcome" -> welcome(
                    helper,
                    payload.path("unsubscribeUrl").asText(),
                    payload.path("oneClickUnsubscribeUrl").asText(),
                    message.locale());
            default -> throw new IllegalArgumentException("Unknown message type: " + message.messageType());
        }
        mail.send(mime);
    }

    private void confirmation(MimeMessageHelper helper, String confirmUrl, String locale) throws Exception {
        requireUrl(confirmUrl);
        if (locale.startsWith("en")) {
            helper.setSubject("Confirm your Zelglihof newsletter subscription");
            helper.setText("Confirm your subscription: " + confirmUrl,
                    html("Confirm your subscription", "Please confirm that you want to receive news from Zelglihof.", "Confirm subscription", confirmUrl));
        } else {
            helper.setSubject("Newsletter-Anmeldung bestätigen");
            helper.setText("Bestätige deine Anmeldung: " + confirmUrl,
                    html("Newsletter-Anmeldung bestätigen", "Bitte bestätige, dass du Neuigkeiten vom Zelglihof erhalten möchtest.", "Anmeldung bestätigen", confirmUrl));
        }
    }

    private void welcome(MimeMessageHelper helper, String unsubscribeUrl, String oneClickUrl, String locale) throws Exception {
        requireUrl(unsubscribeUrl);
        requireUrl(oneClickUrl);
        helper.getMimeMessage().setHeader("List-Unsubscribe", "<" + oneClickUrl + ">");
        helper.getMimeMessage().setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
        if (locale.startsWith("en")) {
            helper.setSubject("Welcome to the Zelglihof newsletter");
            helper.setText("Your subscription is active. Unsubscribe: " + unsubscribeUrl,
                    html("Welcome", "Your subscription is now active.", "Unsubscribe", unsubscribeUrl));
        } else {
            helper.setSubject("Willkommen beim Zelglihof-Newsletter");
            helper.setText("Deine Anmeldung ist aktiv. Abmelden: " + unsubscribeUrl,
                    html("Willkommen", "Deine Newsletter-Anmeldung ist jetzt aktiv.", "Newsletter abbestellen", unsubscribeUrl));
        }
    }

    private String html(String title, String body, String action, String actionUrl) {
        return """
                <!doctype html><html><body style="font-family:Arial,sans-serif;color:#243126;line-height:1.5">
                <main style="max-width:560px;margin:32px auto;padding:24px;border:1px solid #d9ded7;border-radius:12px">
                <h1 style="font-size:24px">%s</h1><p>%s</p>
                <p><a href="%s" style="display:inline-block;padding:12px 18px;background:#365c3b;color:white;text-decoration:none;border-radius:6px">%s</a></p>
                <p style="font-size:12px;color:#667068">Zelglihof</p></main></body></html>
                """.formatted(title, body, actionUrl, action);
    }

    private void requireUrl(String value) {
        if (!value.startsWith("https://") && !value.startsWith("http://")) {
            throw new IllegalArgumentException("Message payload contains no valid URL");
        }
    }
}
