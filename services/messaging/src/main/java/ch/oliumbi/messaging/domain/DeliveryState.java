package ch.oliumbi.messaging.domain;

import java.time.Instant;
import java.util.Objects;

public sealed interface DeliveryState {

    int attempts();

    record Pending(int attempts, Instant availableAt) implements DeliveryState {
        public Pending {
            requireAttempts(attempts);
            Objects.requireNonNull(availableAt);
        }
    }

    record Processing(int attempts, Instant lockedAt) implements DeliveryState {
        public Processing {
            if (attempts < 1) throw new IllegalArgumentException("Processing requires an attempt");
            Objects.requireNonNull(lockedAt);
        }
    }

    record Sent(int attempts, Instant finishedAt) implements DeliveryState {
        public Sent {
            requireCompletedAttempts(attempts);
            Objects.requireNonNull(finishedAt);
        }
    }

    record Failed(int attempts, Instant finishedAt) implements DeliveryState {
        public Failed {
            requireCompletedAttempts(attempts);
            Objects.requireNonNull(finishedAt);
        }
    }

    private static void requireAttempts(int attempts) {
        if (attempts < 0) throw new IllegalArgumentException("Attempt count cannot be negative");
    }

    private static void requireCompletedAttempts(int attempts) {
        if (attempts < 1) throw new IllegalArgumentException("A completed delivery requires an attempt");
    }
}
