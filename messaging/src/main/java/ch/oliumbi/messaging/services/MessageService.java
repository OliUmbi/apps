package ch.oliumbi.messaging.services;

import ch.oliumbi.messaging.data.responses.*;
import ch.oliumbi.messaging.repositories.MessageAttemptRepository;
import ch.oliumbi.messaging.repositories.MessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MessageService {

    // todo a bit weird that we only sparingly check if a status exists i think we shouldn't check if it is in the list or not since if something is searched that does not exists it just returns nothing, and it is something less to keep track of
    private static final Set<String> STATUSES = Set.of("pending", "processing", "sent", "failed");

    private final MessageRepository messageRepository;
    private final MessageAttemptRepository messageAttemptRepository;

    public MessageService(MessageRepository messageRepository, MessageAttemptRepository messageAttemptRepository) {
        this.messageRepository = messageRepository;
        this.messageAttemptRepository = messageAttemptRepository;
    }

    // todo magic values should be moved to a generic solution (probably in a shared lib)
    public MessageHistoryResponse history(String status, int page, int size) {
        if (page < 0 || size < 1 || size > 100 || (status != null && !STATUSES.contains(status))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status or pagination");
        }

        // todo i like the page request structure and direct support by jpa
        var pageable = PageRequest.of(page, size, Sort.by("createdAt", "id").descending());
        var messages = status == null ? messageRepository.findAll(pageable) : messageRepository.findByStatus(status, pageable);

        // todo why dont we use a framework returned page object instead of a custom
        return new MessageHistoryResponse(messages.map(MessageResponse::fromMessage).getContent(),
                page, size, messages.getTotalElements());
    }

    public MessageResponse get(UUID id) {
        return messageRepository.findById(id)
                .map(MessageResponse::fromMessage)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    // todo as noted in controller maybe just merge with the one to many loading
    public List<MessageAttemptResponse> attempts(UUID id) {
        if (!messageRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return messageAttemptRepository.findByMessageIdOrderByAttemptNumber(id).stream()
                .map(MessageAttemptResponse::fromAttempt)
                .toList();
    }
}
