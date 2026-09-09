package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entites.MessageAttempt;

import java.time.Instant;

public record MessageAttemptResponse(
        int attemptNumber,
        String outcome,
        String failureCode,
        String message,
        Instant startedAt,
        Instant finishedAt) {

    public static MessageAttemptResponse fromAttempt(MessageAttempt attempt) {
        return new MessageAttemptResponse(
                attempt.getAttemptNumber(),
                attempt.getOutcome(),
                attempt.getFailureCode(),
                attempt.getMessage(),
                attempt.getStartedAt(),
                attempt.getFinishedAt());
    }
}
