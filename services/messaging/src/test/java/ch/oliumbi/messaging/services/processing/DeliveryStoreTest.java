package ch.oliumbi.messaging.services.processing;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.data.entities.MessageAttempt;
import ch.oliumbi.messaging.data.entities.QueuedMessage;
import ch.oliumbi.messaging.domain.AttemptOutcome;
import ch.oliumbi.messaging.domain.DeliveryResult;
import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.domain.DeliveryStateMachine;
import ch.oliumbi.messaging.domain.FailureDetail;
import ch.oliumbi.messaging.repositories.MessageAttemptRepository;
import ch.oliumbi.messaging.repositories.MessageRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class DeliveryStoreTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");
    private static final Duration LEASE = Duration.ofMinutes(5);
    private static final List<Duration> DELAYS = List.of(Duration.ofMinutes(1), Duration.ofMinutes(5));

    private final MessageRepository messages = mock(MessageRepository.class);
    private final MessageAttemptRepository attempts = mock(MessageAttemptRepository.class);
    private final DeliveryStore store = new DeliveryStore(messages, attempts,
            new DeliveryStateMachine(LEASE, DELAYS), Clock.fixed(NOW, ZoneOffset.UTC));

    private Message message(DeliveryState state) {
        var queued = mock(QueuedMessage.class);
        when(queued.getId()).thenReturn(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        when(queued.getSite()).thenReturn("zelglihof");
        when(queued.getType()).thenReturn("email");
        when(queued.getSender()).thenReturn("hof@zelglihof.ch");
        when(queued.getRecipient()).thenReturn("visitor@example.com");
        when(queued.getSubject()).thenReturn("Neue Hofanfrage");
        when(queued.getText()).thenReturn("details");
        when(queued.getCreatedAt()).thenReturn(NOW.minusSeconds(60));
        return new Message(queued, state);
    }

    @Test
    void claimIsEmptyWhenNothingIsDue() {
        when(messages.findNext(NOW, NOW.minus(LEASE), "")).thenReturn(Optional.empty());

        assertThat(store.claim(new HashSet<>())).isInstanceOf(DeliveryStore.ClaimResult.Empty.class);
    }

    @Test
    void claimStartsADueMessageAndRecordsTheAttempt() {
        var message = message(new DeliveryState.Pending(0, NOW));
        when(messages.findNext(NOW, NOW.minus(LEASE), "")).thenReturn(Optional.of(message));

        var result = store.claim(new HashSet<>());

        assertThat(result).isInstanceOf(DeliveryStore.ClaimResult.Claimed.class);
        var claim = ((DeliveryStore.ClaimResult.Claimed) result).claim();
        assertThat(claim.attempt()).isEqualTo(1);
        assertThat(message.state()).isEqualTo(new DeliveryState.Processing(1, NOW));

        var attempt = ArgumentCaptor.forClass(MessageAttempt.class);
        verify(attempts).save(attempt.capture());
        assertThat(attempt.getValue().getAttemptNumber()).isEqualTo(1);
    }

    @Test
    void claimRecoversAnExpiredLeaseSchedulesTheRetryWithBackoffAndAbandonsTheOldAttempt() {
        var message = message(new DeliveryState.Processing(1, NOW.minus(LEASE)));
        var attempt = mock(MessageAttempt.class);
        when(messages.findNext(NOW, NOW.minus(LEASE), "")).thenReturn(Optional.of(message));
        when(attempts.findByMessageIdAndAttemptNumber(message.getId(), 1)).thenReturn(Optional.of(attempt));

        var result = store.claim(new HashSet<>());

        assertThat(result).isInstanceOf(DeliveryStore.ClaimResult.Deferred.class);
        verify(attempt).finish(AttemptOutcome.ABANDONED, Optional.of(FailureDetail.abandoned()), NOW);
        assertThat(message.state())
                .isEqualTo(new DeliveryState.Pending(1, NOW.plus(Duration.ofMinutes(1))));
    }

    @Test
    void claimRecordsAPoisonedRowInTheRunSkipListBeforeFailing() {
        var message = message(new DeliveryState.Processing(1, NOW.minus(LEASE)));
        when(messages.findNext(NOW, NOW.minus(LEASE), "")).thenReturn(Optional.of(message));
        when(attempts.findByMessageIdAndAttemptNumber(message.getId(), 1)).thenReturn(Optional.empty());

        var skipped = new HashSet<UUID>();

        assertThatThrownBy(() -> store.claim(skipped))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("message/attempt " + message.getId() + "/1");
        assertThat(skipped).containsExactly(message.getId());
    }

    @Test
    void claimPassesTheRunSkipListToTheSelection() {
        var skipped = Set.of(UUID.fromString("11111111-2222-3333-4444-555555555555"));
        when(messages.findNext(NOW, NOW.minus(LEASE), "11111111-2222-3333-4444-555555555555"))
                .thenReturn(Optional.empty());

        store.claim(skipped);

        verify(messages).findNext(NOW, NOW.minus(LEASE), "11111111-2222-3333-4444-555555555555");
    }

    @Test
    void claimClosesAMessageThatExhaustedItsAttempts() {
        // two delays allow three attempts: the initial one plus two retries
        var message = message(new DeliveryState.Pending(3, NOW));
        when(messages.findNext(NOW, NOW.minus(LEASE), "")).thenReturn(Optional.of(message));

        var result = store.claim(new HashSet<>());

        assertThat(result).isInstanceOf(DeliveryStore.ClaimResult.Closed.class);
        assertThat(message.state()).isEqualTo(new DeliveryState.Failed(3, NOW));
        verify(attempts, never()).save(any());
    }

    @Test
    void completeFinishesTheAttemptAndTheMessage() {
        var message = message(new DeliveryState.Processing(1, NOW));
        var attempt = mock(MessageAttempt.class);
        when(messages.findLockedById(message.getId())).thenReturn(Optional.of(message));
        when(attempts.findByMessageIdAndAttemptNumber(message.getId(), 1)).thenReturn(Optional.of(attempt));

        store.complete(message.claim(), new DeliveryResult.Sent());

        verify(attempt).finish(AttemptOutcome.SENT, Optional.empty(), NOW);
        assertThat(message.state()).isEqualTo(new DeliveryState.Sent(1, NOW));
    }

    @Test
    void completeIgnoresAStaleCompletion() {
        var message = message(new DeliveryState.Processing(1, NOW));
        when(messages.findLockedById(message.getId())).thenReturn(Optional.of(message));

        var stale = new ch.oliumbi.messaging.domain.DeliveryClaim(
                message.getId(), 9, "zelglihof", "email",
                "hof@zelglihof.ch", "visitor@example.com", null,
                "Neue Hofanfrage", "details", null);

        store.complete(stale, new DeliveryResult.Sent());

        verifyNoInteractions(attempts);
        assertThat(message.state()).isEqualTo(new DeliveryState.Processing(1, NOW));
    }

    @Test
    void completeRejectsAMissingMessageWithADescriptiveFailure() {
        when(messages.findLockedById(any())).thenReturn(Optional.empty());

        var claim = message(new DeliveryState.Processing(1, NOW)).claim();

        assertThatThrownBy(() -> store.complete(claim, new DeliveryResult.Sent()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("message " + claim.messageId());
    }
}
