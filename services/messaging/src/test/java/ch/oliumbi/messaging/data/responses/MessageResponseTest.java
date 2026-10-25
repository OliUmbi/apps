package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.data.entities.QueuedMessage;
import ch.oliumbi.messaging.domain.DeliveryState;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MessageResponseTest {

    private static final Instant QUEUED_AT = Instant.parse("2026-10-25T09:00:00Z");
    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    @Test
    void listViewExposesSenderAndLeaseTimestamp() {
        var queued = mock(QueuedMessage.class);
        when(queued.getId()).thenReturn(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        when(queued.getSite()).thenReturn("zelglihof");
        when(queued.getType()).thenReturn("email");
        when(queued.getSender()).thenReturn("hof@zelglihof.ch");
        when(queued.getRecipient()).thenReturn("visitor@example.com");
        when(queued.getSubject()).thenReturn("Neue Hofanfrage");
        when(queued.getText()).thenReturn("details");
        when(queued.getCreatedAt()).thenReturn(QUEUED_AT);

        var message = new Message(queued, new DeliveryState.Pending(0, QUEUED_AT));
        message.apply(new DeliveryState.Processing(1, NOW));

        var response = MessageResponse.fromMessage(message);

        assertThat(response.sender()).isEqualTo("hof@zelglihof.ch");
        assertThat(response.lockedAt()).isEqualTo(NOW);
        assertThat(response.status()).isEqualTo("processing");
    }
}
