package ch.oliumbi.messaging.controllers;

import ch.oliumbi.messaging.data.responses.*;
import ch.oliumbi.messaging.services.*;
import org.springframework.data.domain.*;
import org.springframework.data.web.*;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

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

    // todo if the pagedModel setup is not recommended im happy to move back to a self-built representation
    @GetMapping
    public PagedModel<MessageResponse> history(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                              @RequestParam(required = false) String status,
                                              @SortDefault(sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        internalAuthorizationService.requireValid(authorization);
        return new PagedModel<>(messageService.history(status, pageable));
    }

    @GetMapping("/{id}")
    public MessageDetailResponse get(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                     @PathVariable UUID id) {
        internalAuthorizationService.requireValid(authorization);
        return messageService.get(id);
    }
}
