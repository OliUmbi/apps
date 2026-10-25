package ch.oliumbi.messaging.services.processing;

import ch.oliumbi.messaging.configurations.WorkerProperties;
import ch.oliumbi.messaging.domain.DeliveryClaim;
import ch.oliumbi.messaging.domain.DeliveryResult;
import ch.oliumbi.messaging.services.delivery.EmailDelivery;
import ch.oliumbi.messaging.services.intake.MessageIntakeService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MessageWorkerTest {

    private static final DeliveryClaim CLAIM = new DeliveryClaim(
            UUID.fromString("11111111-2222-3333-4444-555555555555"), 1,
            "zelglihof", "email",
            "hof@zelglihof.ch", "visitor@example.com", null,
            "Neue Hofanfrage", "details", null);

    private final MessageIntakeService intake = mock(MessageIntakeService.class);
    private final DeliveryStore store = mock(DeliveryStore.class);
    private final EmailDelivery delivery = mock(EmailDelivery.class);
    private final MessageWorker worker = new MessageWorker(intake, store, delivery,
            new WorkerProperties(3, 1000, 1000, Duration.ofMinutes(5), List.of(Duration.ofMinutes(2))));

    @Test
    void deliverContinuesAfterAClaimFailure() {
        when(store.claim(any()))
                .thenThrow(new IllegalStateException("poisoned"))
                .thenReturn(new DeliveryStore.ClaimResult.Empty());

        worker.deliver();

        verify(store, times(2)).claim(any());
        verify(delivery, never()).send(any());
    }

    @Test
    void deliverContinuesAfterACompletionFailureAndSkipsTheRowForTheRun() {
        when(store.claim(any()))
                .thenReturn(new DeliveryStore.ClaimResult.Claimed(CLAIM))
                .thenReturn(new DeliveryStore.ClaimResult.Empty());
        when(delivery.send(any())).thenReturn(new DeliveryResult.Sent());
        doThrow(new IllegalStateException("poisoned")).when(store).complete(any(), any());

        worker.deliver();

        verify(store, times(2)).claim(any());
        var skipped = ArgumentCaptor.forClass(Set.class);
        verify(store, times(2)).claim(skipped.capture());
        assertThat(skipped.getValue()).containsExactly(CLAIM.messageId());
    }

    @Test
    void theRunSkipListStartsEmptyOnEveryPoll() {
        when(store.claim(any()))
                .thenReturn(new DeliveryStore.ClaimResult.Claimed(CLAIM))
                .thenReturn(new DeliveryStore.ClaimResult.Empty())
                .thenReturn(new DeliveryStore.ClaimResult.Empty());
        when(delivery.send(any())).thenReturn(new DeliveryResult.Sent());
        doThrow(new IllegalStateException("poisoned")).when(store).complete(any(), any());

        worker.deliver();
        worker.deliver();

        var skipped = ArgumentCaptor.forClass(Set.class);
        verify(store, times(3)).claim(skipped.capture());
        assertThat(skipped.getAllValues().get(0)).containsExactly(CLAIM.messageId());
        assertThat(skipped.getAllValues().get(2)).isEmpty();
    }

    @Test
    void acceptContinuesAfterAnIntakeFailure() {
        when(intake.acceptNext(any()))
                .thenThrow(new IllegalStateException("poisoned"))
                .thenReturn(false);

        worker.accept();

        verify(intake, times(2)).acceptNext(any());
    }

    @Test
    void acceptAndDeliverRunOnIndependentPollDelays() throws Exception {
        var accept = MessageWorker.class.getMethod("accept").getAnnotation(Scheduled.class);
        var deliver = MessageWorker.class.getMethod("deliver").getAnnotation(Scheduled.class);

        assertThat(accept.fixedDelayString()).isEqualTo("${messaging.worker.accept-poll-delay-ms}");
        assertThat(deliver.fixedDelayString()).isEqualTo("${messaging.worker.deliver-poll-delay-ms}");
    }
}
