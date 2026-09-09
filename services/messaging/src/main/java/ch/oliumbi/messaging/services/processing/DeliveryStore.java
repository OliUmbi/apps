package ch.oliumbi.messaging.services.processing;

import ch.oliumbi.messaging.data.entites.*;
import ch.oliumbi.messaging.domain.*;
import ch.oliumbi.messaging.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

/**
 * Applies state-machine decisions and attempt history in one transaction.
 * The message row lock serializes claim, recovery and completion; SMTP runs outside this boundary.
 */
@Slf4j
@Service
public class DeliveryStore {

    public sealed interface ClaimResult {
        record Empty() implements ClaimResult {}
        record Closed() implements ClaimResult {}
        record Claimed(DeliveryClaim claim) implements ClaimResult {}
    }

    private final MessageRepository messages;
    private final MessageAttemptRepository attempts;
    private final DeliveryStateMachine stateMachine;
    private final Clock clock;

    public DeliveryStore(MessageRepository messages, MessageAttemptRepository attempts,
                         DeliveryStateMachine stateMachine, Clock clock) {
        this.messages = messages;
        this.attempts = attempts;
        this.stateMachine = stateMachine;
        this.clock = clock;
    }

    @Transactional
    public ClaimResult claim() {
        var now = clock.instant();

        var candidate = messages.findNext(now, now.minus(stateMachine.leaseDuration()));
        if (candidate.isEmpty()) {
            return new ClaimResult.Empty();
        }

        var message = candidate.get();
        return switch (stateMachine.claim(message.state(), now)) {
            case DeliveryStateMachine.ClaimDecision.Idle ignored -> new ClaimResult.Empty();
            case DeliveryStateMachine.ClaimDecision.Start start -> start(message, start.next(), now);
            case DeliveryStateMachine.ClaimDecision.Recover recover -> {
                abandon(message, now);
                yield start(message, recover.next(), now);
            }
            case DeliveryStateMachine.ClaimDecision.Exhausted exhausted -> {
                if (message.state() instanceof DeliveryState.Processing) {
                    abandon(message, now);
                }
                message.apply(exhausted.next());
                log.warn("Message {} exhausted its attempts", message.getId());
                yield new ClaimResult.Closed();
            }
        };
    }

    @Transactional
    public void complete(DeliveryClaim claim, DeliveryResult result) {
        var message = messages.findLockedById(claim.messageId()).orElseThrow();
        var now = clock.instant();

        switch (stateMachine.complete(message.state(), claim.attempt(), result, now)) {
            case DeliveryStateMachine.CompletionDecision.Stale ignored -> log.warn("Ignored stale completion for message {} attempt {}", claim.messageId(), claim.attempt());
            case DeliveryStateMachine.CompletionDecision.Accepted accepted -> {
                var attempt = attempts.findByMessageIdAndAttemptNumber(claim.messageId(), claim.attempt()).orElseThrow();
                attempt.finish(accepted.outcome(), accepted.detail(), now);
                message.apply(accepted.next());
                accepted.detail().ifPresent(detail -> log.warn("Message {} attempt {}: {} ({})", claim.messageId(), claim.attempt(), detail.code(), accepted.outcome()));
            }
        }
    }

    private ClaimResult.Claimed start(Message message, DeliveryState.Processing next, Instant now) {
        message.apply(next);
        attempts.save(new MessageAttempt(message.getId(), next.attempts(), now));
        return new ClaimResult.Claimed(message.claim());
    }

    private void abandon(Message message, Instant now) {
        var attempt = attempts.findByMessageIdAndAttemptNumber(message.getId(), message.getAttemptCount()).orElseThrow();

        attempt.finish(AttemptOutcome.ABANDONED, Optional.of(FailureDetail.abandoned()), now);
        log.warn("Message {} attempt {} abandoned", message.getId(), message.getAttemptCount());
    }
}
