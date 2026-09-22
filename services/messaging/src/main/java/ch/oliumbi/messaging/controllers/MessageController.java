package ch.oliumbi.messaging.controllers;

import ch.oliumbi.messaging.data.responses.MessageDetailResponse;
import ch.oliumbi.messaging.data.responses.MessageResponse;
import ch.oliumbi.messaging.services.MessageService;
import ch.oliumbi.shared.security.BearerTokenVerifier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/message")
public class MessageController {

    private final MessageService messageService;
    private final BearerTokenVerifier authorization;

    public MessageController(MessageService messageService, BearerTokenVerifier authorization) {
        this.messageService = messageService;
        this.authorization = authorization;
    }

    @GetMapping
    public PagedModel<MessageResponse> history(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                              @RequestParam(required = false) String status,
                                              @SortDefault(sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        this.authorization.requireValid(authorization);
        return new PagedModel<>(messageService.history(status, pageable));
    }

    @GetMapping("/{id}")
    public MessageDetailResponse get(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                     @PathVariable UUID id) {
        this.authorization.requireValid(authorization);
        return messageService.get(id);
    }
}
