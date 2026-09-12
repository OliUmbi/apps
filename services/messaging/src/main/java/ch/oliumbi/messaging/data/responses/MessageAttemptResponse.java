package ch.oliumbi.messaging.data.responses;

import ch.oliumbi.messaging.data.entities.MessageAttempt;
import ch.oliumbi.messaging.domain.FailureDetail;

import java.time.Instant;
import java.util.Locale;

public record MessageAttemptResponse(int attemptNumber, String outcome, FailureDetail detail,
                                     Instant startedAt, Instant finishedAt, Instant createdAt, Instant updatedAt) {
    public static MessageAttemptResponse fromAttempt(MessageAttempt attempt) {
        return new MessageAttemptResponse(attempt.getAttemptNumber(),
                attempt.getOutcome() == null ? null : attempt.getOutcome().name().toLowerCase(Locale.ROOT),
                attempt.getDetail(), attempt.getStartedAt(), attempt.getFinishedAt(),
                attempt.getCreatedAt(), attempt.getUpdatedAt());
    }
}
