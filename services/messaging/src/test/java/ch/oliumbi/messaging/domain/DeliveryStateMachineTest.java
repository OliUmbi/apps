package ch.oliumbi.messaging.domain;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliveryStateMachineTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");
    private static final Duration LEASE = Duration.ofMinutes(5);

    /** Three retries after the first attempt, with a growing backoff. */
    private static final List<Duration> DELAYS =
            List.of(Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(15));

    private final DeliveryStateMachine machine = new DeliveryStateMachine(LEASE, DELAYS);

    @Test
    void rejectsNonPositiveLeaseAndDelays() {
        assertThatThrownBy(() -> new DeliveryStateMachine(Duration.ZERO, DELAYS))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DeliveryStateMachine(LEASE, List.of(Duration.ZERO)))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DeliveryStateMachine(LEASE, List.of(Duration.ofSeconds(-1))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void pendingMessageNotYetAvailableIsIdle() {
        var decision = machine.claim(new DeliveryState.Pending(0, NOW.plusSeconds(1)), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Idle.class);
    }

    @Test
    void availablePendingMessageStartsFirstAttempt() {
        var decision = machine.claim(new DeliveryState.Pending(0, NOW), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Start.class)
                .extracting(d -> ((DeliveryStateMachine.ClaimDecision.Start) d).next())
                .isEqualTo(new DeliveryState.Processing(1, NOW));
    }

    @Test
    void pendingMessageWithAttemptsLeftStartsTheNextAttempt() {
        var decision = machine.claim(new DeliveryState.Pending(2, NOW), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Start.class)
                .extracting(d -> ((DeliveryStateMachine.ClaimDecision.Start) d).next().attempts())
                .isEqualTo(3);
    }

    @Test
    void pendingMessageBeyondTheScheduleIsExhausted() {
        // four attempts are allowed (initial + three retries)
        var decision = machine.claim(new DeliveryState.Pending(4, NOW), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Exhausted.class)
                .extracting(d -> ((DeliveryStateMachine.ClaimDecision.Exhausted) d).next())
                .isEqualTo(new DeliveryState.Failed(4, NOW));
    }

    @Test
    void processingMessageInsideItsLeaseIsIdle() {
        var decision = machine.claim(new DeliveryState.Processing(1, NOW.minus(LEASE).plusSeconds(1)), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Idle.class);
    }

    @Test
    void processingMessageWithExpiredLeaseIsRecovered() {
        var decision = machine.claim(new DeliveryState.Processing(1, NOW.minus(LEASE)), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Recover.class)
                .extracting(d -> ((DeliveryStateMachine.ClaimDecision.Recover) d).next())
                .isEqualTo(new DeliveryState.Processing(2, NOW));
    }

    @Test
    void processingMessageWithExpiredLeaseAndNoAttemptsLeftIsExhausted() {
        var decision = machine.claim(new DeliveryState.Processing(4, NOW.minus(LEASE)), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.ClaimDecision.Exhausted.class);
    }

    @Test
    void completedMessagesAreNeverClaimedAgain() {
        assertThat(machine.claim(new DeliveryState.Sent(1, NOW), NOW))
                .isInstanceOf(DeliveryStateMachine.ClaimDecision.Idle.class);
        assertThat(machine.claim(new DeliveryState.Failed(4, NOW), NOW))
                .isInstanceOf(DeliveryStateMachine.ClaimDecision.Idle.class);
    }

    @Test
    void completionForAnotherAttemptIsStale() {
        var state = new DeliveryState.Processing(2, NOW);

        assertThat(machine.complete(state, 1, new DeliveryResult.Sent(), NOW))
                .isInstanceOf(DeliveryStateMachine.CompletionDecision.Stale.class);
        assertThat(machine.complete(new DeliveryState.Pending(1, NOW), 1, new DeliveryResult.Sent(), NOW))
                .isInstanceOf(DeliveryStateMachine.CompletionDecision.Stale.class);
    }

    @Test
    void sentResultFinishesTheMessage() {
        var decision = machine.complete(new DeliveryState.Processing(1, NOW), 1, new DeliveryResult.Sent(), NOW);

        assertThat(decision).isInstanceOf(DeliveryStateMachine.CompletionDecision.Accepted.class);
        var accepted = (DeliveryStateMachine.CompletionDecision.Accepted) decision;
        assertThat(accepted.next()).isEqualTo(new DeliveryState.Sent(1, NOW));
        assertThat(accepted.outcome()).isEqualTo(AttemptOutcome.SENT);
        assertThat(accepted.detail()).isEmpty();
    }

    @Test
    void rejectedResultFailsImmediatelyWithoutRetrying() {
        var detail = new FailureDetail("INVALID_REQUEST", "Invalid fields: sender");
        var decision = machine.complete(
                new DeliveryState.Processing(1, NOW), 1, new DeliveryResult.Rejected(detail), NOW);

        var accepted = (DeliveryStateMachine.CompletionDecision.Accepted) decision;
        assertThat(accepted.next()).isEqualTo(new DeliveryState.Failed(1, NOW));
        assertThat(accepted.outcome()).isEqualTo(AttemptOutcome.REJECTED);
        assertThat(accepted.detail()).contains(detail);
    }

    @Test
    void retryableFailureSchedulesTheNextAttemptWithTheConfiguredDelay() {
        var detail = new FailureDetail("SMTP_DELIVERY_FAILED", "not confirmed");
        var firstRetry = machine.complete(
                new DeliveryState.Processing(1, NOW), 1, new DeliveryResult.RetryableFailure(detail), NOW);
        var secondRetry = machine.complete(
                new DeliveryState.Processing(2, NOW), 2, new DeliveryResult.RetryableFailure(detail), NOW);

        var first = (DeliveryStateMachine.CompletionDecision.Accepted) firstRetry;
        assertThat(first.next()).isEqualTo(new DeliveryState.Pending(1, NOW.plus(Duration.ofMinutes(1))));
        assertThat(first.outcome()).isEqualTo(AttemptOutcome.RETRY);

        var second = (DeliveryStateMachine.CompletionDecision.Accepted) secondRetry;
        assertThat(second.next()).isEqualTo(new DeliveryState.Pending(2, NOW.plus(Duration.ofMinutes(5))));
    }

    @Test
    void retryableFailureOnTheLastAttemptFailsTheMessage() {
        var detail = new FailureDetail("SMTP_DELIVERY_FAILED", "not confirmed");
        var decision = machine.complete(
                new DeliveryState.Processing(4, NOW), 4, new DeliveryResult.RetryableFailure(detail), NOW);

        var accepted = (DeliveryStateMachine.CompletionDecision.Accepted) decision;
        assertThat(accepted.next()).isEqualTo(new DeliveryState.Failed(4, NOW));
        assertThat(accepted.outcome()).isEqualTo(AttemptOutcome.FAILED);
        assertThat(accepted.detail()).contains(detail);
    }
}
