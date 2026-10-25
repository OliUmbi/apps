package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.repositories.MessageAttemptRepository;
import ch.oliumbi.messaging.repositories.MessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class MessageServiceTest {

    private final MessageRepository messages = mock(MessageRepository.class);
    private final MessageAttemptRepository attempts = mock(MessageAttemptRepository.class);
    private final MessageService service = new MessageService(messages, attempts);

    @Test
    void anUnknownStatusFilterReturnsAnEmptyPage() {
        var page = service.history("nonsense", PageRequest.of(0, 10));

        assertThat(page).isEmpty();
        verifyNoInteractions(messages, attempts);
    }
}
