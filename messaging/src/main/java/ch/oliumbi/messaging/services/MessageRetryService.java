package ch.oliumbi.messaging.services;

import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class MessageRetryService {

    private static final int MAX_ATTEMPTS = 5;

    public boolean canRetry(int attemptCount) {
        return attemptCount < MAX_ATTEMPTS;
    }

    // todo make it more readable and why are there so many magic values
    public Duration delay(int attemptCount) {
        return Duration.ofMinutes(Math.min(30, 1L << Math.min(attemptCount, 5)));
    }

    public Duration leaseDuration() {
        return Duration.ofMinutes(5);
    }
}
