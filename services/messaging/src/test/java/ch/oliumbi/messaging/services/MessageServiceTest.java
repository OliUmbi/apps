package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.data.entities.MessageAttempt;
import ch.oliumbi.messaging.data.entities.QueuedMessage;
import ch.oliumbi.messaging.data.responses.MessageResponse;
import ch.oliumbi.messaging.domain.AttemptOutcome;
import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.domain.FailureDetail;
import ch.oliumbi.messaging.domain.MessageStatus;
import ch.oliumbi.messaging.repositories.MessageAttemptRepository;
import ch.oliumbi.messaging.repositories.MessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class MessageServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-25T10:00:00Z");
    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");
    private static final Pageable PAGEABLE = PageRequest.of(0, 10);

    private final MessageRepository messages = mock(MessageRepository.class);
    private final MessageAttemptRepository attempts = mock(MessageAttemptRepository.class);
    private final MessageService service = new MessageService(messages, attempts);

    private static Message pendingMessage() {
        var queued = mock(QueuedMessage.class);
        when(queued.getId()).thenReturn(UUID.randomUUID());
        when(queued.getSite()).thenReturn("zelglihof");
        when(queued.getType()).thenReturn("email");
        when(queued.getSender()).thenReturn("hof@zelglihof.ch");
        when(queued.getRecipient()).thenReturn("visitor@example.com");
        when(queued.getSubject()).thenReturn("Neue Hofanfrage");
        when(queued.getText()).thenReturn("details");
        when(queued.getCreatedAt()).thenReturn(NOW.minusSeconds(60));
        return new Message(queued, new DeliveryState.Pending(0, NOW));
    }

    @Test
    void anUnknownStatusFilterReturnsAnEmptyPage() {
        var page = service.history("nonsense", PAGEABLE);

        assertThat(page).isEmpty();
        verifyNoInteractions(messages, attempts);
    }

    @Test
    void historyWithoutAStatusListsEveryMessage() {
        var message = pendingMessage();
        when(messages.findAll(PAGEABLE)).thenReturn(new PageImpl<>(List.of(message), PAGEABLE, 1));

        var page = service.history(null, PAGEABLE);

        verify(messages).findAll(PAGEABLE);
        verify(messages, never()).findByStatus(any(), any());
        assertThat(page).singleElement().extracting(MessageResponse::status).isEqualTo("pending");
    }

    @Test
    void historyMapsTheStatusFilterCaseInsensitively() {
        when(messages.findByStatus(MessageStatus.SENT, PAGEABLE))
                .thenReturn(new PageImpl<>(List.of(), PAGEABLE, 0));

        service.history("sent", PAGEABLE);
        service.history("SENT", PAGEABLE);

        verify(messages, times(2)).findByStatus(MessageStatus.SENT, PAGEABLE);
        verify(messages, never()).findAll(any(Pageable.class));
    }

    @Test
    void getRejectsAnUnknownMessage() {
        when(messages.findById(ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(ID))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void getMapsTheAttemptHistory() {
        var abandoned = new MessageAttempt(ID, 2, NOW);
        abandoned.finish(AttemptOutcome.ABANDONED, Optional.of(FailureDetail.abandoned()), NOW);
        var message = pendingMessage();
        when(messages.findById(ID)).thenReturn(Optional.of(message));
        when(attempts.findByMessageIdOrderByAttemptNumber(ID)).thenReturn(List.of(abandoned));

        var detail = service.get(ID);

        assertThat(detail.message().status()).isEqualTo("pending");
        assertThat(detail.attempts()).singleElement().satisfies(attempt -> {
            assertThat(attempt.attemptNumber()).isEqualTo(2);
            assertThat(attempt.outcome()).isEqualTo("abandoned");
            assertThat(attempt.detail()).isEqualTo(FailureDetail.abandoned());
            assertThat(attempt.startedAt()).isEqualTo(NOW);
            assertThat(attempt.finishedAt()).isEqualTo(NOW);
        });
    }
}
