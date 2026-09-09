package ch.oliumbi.messaging.domain;

import java.util.Objects;

public sealed interface DeliveryResult {

    record Sent() implements DeliveryResult {
    }

    record RetryableFailure(FailureDetail detail) implements DeliveryResult {
        public RetryableFailure {
            Objects.requireNonNull(detail);
        }
    }

    record Rejected(FailureDetail detail) implements DeliveryResult {
        public Rejected {
            Objects.requireNonNull(detail);
        }
    }
}
