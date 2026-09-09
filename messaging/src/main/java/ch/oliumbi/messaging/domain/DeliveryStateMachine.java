package ch.oliumbi.messaging.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

// todo i very much like the state machine some parts are a bit hard to read but i think we dont need to change any behaviour (if there are nice ways to make it a bit more readable that would be nice)
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
            case DeliveryResult.Sent ignored -> new CompletionDecision.Accepted(new DeliveryState.Sent(claimedAttempt, now), AttemptOutcome.SENT, Optional.empty());
            case DeliveryResult.Rejected rejected -> new CompletionDecision.Accepted(new DeliveryState.Failed(claimedAttempt, now), AttemptOutcome.REJECTED, Optional.of(rejected.detail()));
            case DeliveryResult.RetryableFailure failure -> {
                if (exhausted(claimedAttempt)) {
                    yield new CompletionDecision.Accepted(new DeliveryState.Failed(claimedAttempt, now), AttemptOutcome.FAILED, Optional.of(failure.detail()));
                }
                yield new CompletionDecision.Accepted(new DeliveryState.Pending(claimedAttempt, now.plus(retryDelays.get(claimedAttempt - 1))), AttemptOutcome.RETRY, Optional.of(failure.detail()));
            }
        };
    }

    private boolean exhausted(int attempts) {
        return attempts >= retryDelays.size() + 1;
    }
}
