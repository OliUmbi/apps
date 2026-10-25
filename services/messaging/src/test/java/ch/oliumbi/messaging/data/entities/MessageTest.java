package ch.oliumbi.messaging.data.entities;

import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.domain.MessageStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MessageTest {

    private static final Instant QUEUED_AT = Instant.parse("2026-10-25T09:00:00Z");
    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    private QueuedMessage queued() {
        var queued = mock(QueuedMessage.class);
        when(queued.getId()).thenReturn(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        when(queued.getSite()).thenReturn("zelglihof");
        when(queued.getType()).thenReturn("email");
        when(queued.getSender()).thenReturn("hof@zelglihof.ch");
        when(queued.getRecipient()).thenReturn("hof@zelglihof.ch");
        when(queued.getReplyTo()).thenReturn("visitor@example.com");
        when(queued.getSubject()).thenReturn("Neue Hofanfrage");
        when(queued.getText()).thenReturn("details");
        when(queued.getHtml()).thenReturn("<p>details</p>");
        when(queued.getCreatedAt()).thenReturn(QUEUED_AT);
        return queued;
    }

    @Test
    void queuedMessageStartsPendingAndIsNotClaimable() {
        var message = new Message(queued(), new DeliveryState.Pending(0, QUEUED_AT));

        assertThat(message.getQueueId()).isEqualTo(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        assertThat(message.getReplyTo()).isEqualTo("visitor@example.com");
        assertThat(message.getRequestedAt()).isEqualTo(QUEUED_AT);
        assertThat(message.getStatus()).isEqualTo(MessageStatus.PENDING);
        assertThat(message.getAttemptCount()).isZero();
        assertThat(message.state()).isEqualTo(new DeliveryState.Pending(0, QUEUED_AT));
        assertThatThrownBy(message::claim).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void applyKeepsExactlyOneLifecycleTimestamp() {
        var message = new Message(queued(), new DeliveryState.Pending(0, QUEUED_AT));

        message.apply(new DeliveryState.Processing(1, NOW));
        assertThat(message.getStatus()).isEqualTo(MessageStatus.PROCESSING);
        assertThat(message.getAttemptCount()).isEqualTo(1);
        assertThat(message.getLockedAt()).isEqualTo(NOW);
        assertThat(message.getAvailableAt()).isNull();
        assertThat(message.getFinishedAt()).isNull();

        message.apply(new DeliveryState.Sent(1, NOW.plusSeconds(5)));
        assertThat(message.getStatus()).isEqualTo(MessageStatus.SENT);
        assertThat(message.getFinishedAt()).isEqualTo(NOW.plusSeconds(5));
        assertThat(message.getLockedAt()).isNull();
    }

    @Test
    void claimCarriesTheEnvelopeOfTheQueuedMessage() {
        var message = new Message(queued(), new DeliveryState.Pending(0, QUEUED_AT));
        message.apply(new DeliveryState.Processing(1, NOW));

        var claim = message.claim();

        assertThat(claim.messageId()).isEqualTo(message.getId());
        assertThat(claim.attempt()).isEqualTo(1);
        assertThat(claim.site()).isEqualTo("zelglihof");
        assertThat(claim.type()).isEqualTo("email");
        assertThat(claim.sender()).isEqualTo("hof@zelglihof.ch");
        assertThat(claim.recipient()).isEqualTo("hof@zelglihof.ch");
        assertThat(claim.replyTo()).isEqualTo("visitor@example.com");
        assertThat(claim.subject()).isEqualTo("Neue Hofanfrage");
        assertThat(claim.text()).isEqualTo("details");
        assertThat(claim.html()).isEqualTo("<p>details</p>");
    }

    @Test
    void claimWithoutReplyToCarriesNull() {
        var queued = queued();
        when(queued.getReplyTo()).thenReturn(null);
        var message = new Message(queued, new DeliveryState.Pending(0, QUEUED_AT));
        message.apply(new DeliveryState.Processing(1, NOW));

        assertThat(message.claim().replyTo()).isNull();
    }
}
