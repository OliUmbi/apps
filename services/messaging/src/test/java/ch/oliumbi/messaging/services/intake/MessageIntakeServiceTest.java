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
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
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
        when(queue.findNext("")).thenReturn(Optional.of(queued));
        when(messages.existsByQueueId(queued.getId())).thenReturn(false);

        assertThat(intake.acceptNext(new HashSet<>())).isTrue();

        var saved = ArgumentCaptor.forClass(Message.class);
        verify(messages).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getQueueId()).isEqualTo(queued.getId());
        assertThat(saved.getValue().state().attempts()).isZero();
        verify(queue).delete(queued);
    }

    @Test
    void keepsDuplicateQueueEntriesOutButStillDropsThem() {
        var queued = queued();
        when(queue.findNext("")).thenReturn(Optional.of(queued));
        when(messages.existsByQueueId(queued.getId())).thenReturn(true);

        assertThat(intake.acceptNext(new HashSet<>())).isTrue();

        verify(messages, never()).saveAndFlush(any());
        verify(queue).delete(queued);
    }

    @Test
    void reportsAnEmptyQueue() {
        when(queue.findNext("")).thenReturn(Optional.empty());

        assertThat(intake.acceptNext(new HashSet<>())).isFalse();

        verify(queue, never()).delete(any());
    }

    @Test
    void recordsAPoisonedRowInTheRunSkipListBeforeFailing() {
        var queued = queued();
        when(queue.findNext("")).thenReturn(Optional.of(queued));
        when(messages.existsByQueueId(queued.getId())).thenReturn(false);
        doThrow(new IllegalStateException("poisoned")).when(messages).saveAndFlush(any());

        var skipped = new HashSet<UUID>();

        assertThatThrownBy(() -> intake.acceptNext(skipped))
                .isInstanceOf(IllegalStateException.class);
        assertThat(skipped).containsExactly(queued.getId());
    }

    @Test
    void passesTheRunSkipListToTheSelection() {
        var skipped = new HashSet<UUID>();
        skipped.add(UUID.fromString("22222222-3333-4444-5555-666666666666"));
        when(queue.findNext("22222222-3333-4444-5555-666666666666")).thenReturn(Optional.empty());

        intake.acceptNext(skipped);

        verify(queue).findNext("22222222-3333-4444-5555-666666666666");
    }
}
