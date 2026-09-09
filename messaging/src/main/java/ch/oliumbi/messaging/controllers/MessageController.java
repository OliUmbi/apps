package ch.oliumbi.messaging.controllers;

import ch.oliumbi.messaging.data.responses.*;
import ch.oliumbi.messaging.services.InternalAuthorizationService;
import ch.oliumbi.messaging.services.MessageService;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/message")
public class MessageController {

    private final MessageService messageService;
    private final InternalAuthorizationService internalAuthorizationService;

    public MessageController(MessageService messageService, InternalAuthorizationService internalAuthorizationService) {
        this.messageService = messageService;
        this.internalAuthorizationService = internalAuthorizationService;
    }

    @GetMapping
    public MessageHistoryResponse history(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "50") int size) {
        internalAuthorizationService.requireValid(authorization);
        return messageService.history(status, page, size);
    }

    @GetMapping("/{id}")
    public MessageResponse get(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                               @PathVariable UUID id) {
        internalAuthorizationService.requireValid(authorization);
        return messageService.get(id);
    }

    // todo maybe fold attempts into the get request of message but not strictly necessary, but would make it simpler
    @GetMapping("/{id}/attempt")
    public List<MessageAttemptResponse> attempts(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                                 @PathVariable UUID id) {
        internalAuthorizationService.requireValid(authorization);
        return messageService.attempts(id);
    }
}
