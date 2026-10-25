package ch.oliumbi.messaging.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DeliveryStateTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");

    @Test
    void pendingAllowsZeroAttemptsButNoneNegative() {
        new DeliveryState.Pending(0, NOW);

        assertThatThrownBy(() -> new DeliveryState.Pending(-1, NOW))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DeliveryState.Pending(0, null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void processingRequiresAnAttempt() {
        new DeliveryState.Processing(1, NOW);

        assertThatThrownBy(() -> new DeliveryState.Processing(0, NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void completedStatesRequireAnAttempt() {
        assertThatThrownBy(() -> new DeliveryState.Sent(0, NOW))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DeliveryState.Failed(0, NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
