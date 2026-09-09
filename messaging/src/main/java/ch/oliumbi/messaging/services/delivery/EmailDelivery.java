package ch.oliumbi.messaging.services.delivery;

import ch.oliumbi.messaging.domain.DeliveryClaim;
import ch.oliumbi.messaging.domain.DeliveryResult;

// todo i dont think we actually need the interface and could rename the smtpemaildelivery to just emaildelivery
public interface EmailDelivery {
    DeliveryResult send(DeliveryClaim claim);
}
