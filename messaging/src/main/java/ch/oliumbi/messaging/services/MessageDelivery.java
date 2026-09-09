package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.MessageClaim;

public interface MessageDelivery {
    void send(MessageClaim message) throws Exception;
}
