package ch.oliumbi.messaging.domain;

public enum AttemptOutcome {
    SENT,
    RETRY,
    FAILED,
    ABANDONED,
    REJECTED
}
