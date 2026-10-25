package ch.oliumbi.messaging.services.intake;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.data.entities.QueuedMessage;
import ch.oliumbi.messaging.repositories.MessageRepository;
import ch.oliumbi.messaging.repositories.QueuedMessageRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MessageIntakeServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    private final QueuedMessageRepository queue = mock(QueuedMessageRepository.class);
    private final MessageRepository messages = mock(MessageRepository.class);
    private final MessageIntakeService intake =
            new MessageIntakeService(queue, messages, Clock.fixed(NOW, ZoneOffset.UTC));

    private QueuedMessage queued() {
        var queued = mock(QueuedMessage.class);
        when(queued.getId()).thenReturn(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        when(queued.getCreatedAt()).thenReturn(NOW.minusSeconds(60));
        return queued;
    }

    @Test
    void acceptsAQueuedMessageAndRemovesItFromTheQueue() {
        var queued = queued();
        when(queue.findNext()).thenReturn(Optional.of(queued));
        when(messages.existsByQueueId(queued.getId())).thenReturn(false);

        assertThat(intake.acceptNext()).isTrue();

        var saved = ArgumentCaptor.forClass(Message.class);
        verify(messages).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getQueueId()).isEqualTo(queued.getId());
        assertThat(saved.getValue().state().attempts()).isZero();
        verify(queue).delete(queued);
    }

    @Test
    void keepsDuplicateQueueEntriesOutButStillDropsThem() {
        var queued = queued();
        when(queue.findNext()).thenReturn(Optional.of(queued));
        when(messages.existsByQueueId(queued.getId())).thenReturn(true);

        assertThat(intake.acceptNext()).isTrue();

        verify(messages, never()).saveAndFlush(any());
        verify(queue).delete(queued);
    }

    @Test
    void reportsAnEmptyQueue() {
        when(queue.findNext()).thenReturn(Optional.empty());

        assertThat(intake.acceptNext()).isFalse();

        verify(queue, never()).delete(any());
    }
}
