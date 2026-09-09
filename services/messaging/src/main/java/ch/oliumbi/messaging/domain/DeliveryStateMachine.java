package ch.oliumbi.messaging.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public final class DeliveryStateMachine {

    public sealed interface ClaimDecision {
        record Idle() implements ClaimDecision {
        }

        record Start(DeliveryState.Processing next) implements ClaimDecision {
        }

        record Recover(DeliveryState.Processing next) implements ClaimDecision {
        }

        record Exhausted(DeliveryState.Failed next) implements ClaimDecision {
        }
    }

    public sealed interface CompletionDecision {
        record Stale() implements CompletionDecision {
        }

        record Accepted(
                DeliveryState next,
                AttemptOutcome outcome,
                Optional<FailureDetail> detail) implements CompletionDecision {
        }
    }

    private final Duration leaseDuration;
    private final List<Duration> retryDelays;

    public DeliveryStateMachine(Duration leaseDuration, List<Duration> retryDelays) {
        if (leaseDuration.isNegative() || leaseDuration.isZero()
                || retryDelays.stream().anyMatch(delay -> delay.isNegative() || delay.isZero())) {
            throw new IllegalArgumentException("Lease and retry delays must be positive");
        }

        this.leaseDuration = leaseDuration;
        this.retryDelays = List.copyOf(retryDelays);
    }

    public Duration leaseDuration() {
        return leaseDuration;
    }

    public ClaimDecision claim(DeliveryState state, Instant now) {
        return switch (state) {
            case DeliveryState.Pending pending -> {

                if (pending.availableAt().isAfter(now)) {
                    yield new ClaimDecision.Idle();
                }

                if (exhausted(pending.attempts())) {
                    yield new ClaimDecision.Exhausted(new DeliveryState.Failed(pending.attempts(), now));
                }

                yield new ClaimDecision.Start(new DeliveryState.Processing(pending.attempts() + 1, now));
            }
            case DeliveryState.Processing processing -> {
                if (processing.lockedAt().plus(leaseDuration).isAfter(now)) {
                    yield new ClaimDecision.Idle();
                }

                if (exhausted(processing.attempts())) {
                    yield new ClaimDecision.Exhausted(new DeliveryState.Failed(processing.attempts(), now));
                }

                yield new ClaimDecision.Recover(new DeliveryState.Processing(processing.attempts() + 1, now));
            }
            case DeliveryState.Sent ignored -> new ClaimDecision.Idle();
            case DeliveryState.Failed ignored -> new ClaimDecision.Idle();
        };
    }

    public CompletionDecision complete(DeliveryState state, int claimedAttempt, DeliveryResult result, Instant now) {
        if (!(state instanceof DeliveryState.Processing processing) || processing.attempts() != claimedAttempt) {
            return new CompletionDecision.Stale();
        }

        return switch (result) {
            case DeliveryResult.Sent ignored -> new CompletionDecision.Accepted(
                    new DeliveryState.Sent(claimedAttempt, now),
                    AttemptOutcome.SENT, Optional.empty());
            case DeliveryResult.Rejected rejected -> new CompletionDecision.Accepted(
                    new DeliveryState.Failed(claimedAttempt, now),
                    AttemptOutcome.REJECTED, Optional.of(rejected.detail()));
            case DeliveryResult.RetryableFailure failure -> retryOrFail(claimedAttempt, failure.detail(), now);
        };
    }

    private CompletionDecision.Accepted retryOrFail(int attempt, FailureDetail detail, Instant now) {
        if (exhausted(attempt)) {
            return new CompletionDecision.Accepted(
                    new DeliveryState.Failed(attempt, now),
                    AttemptOutcome.FAILED, Optional.of(detail));
        }

        // Attempt one uses the first retry delay; each later failure advances the schedule.
        var retryAt = now.plus(retryDelays.get(attempt - 1));
        return new CompletionDecision.Accepted(
                new DeliveryState.Pending(attempt, retryAt),
                AttemptOutcome.RETRY, Optional.of(detail));
    }

    private boolean exhausted(int attempts) {
        return attempts >= retryDelays.size() + 1;
    }
}
