package ch.oliumbi.messaging;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/messages")
class MessagingController {
    private final MessagingService messaging;
    private final InternalAuthorization authorization;

    MessagingController(MessagingService messaging, InternalAuthorization authorization) {
        this.messaging = messaging;
        this.authorization = authorization;
    }

    @PostMapping
    @ResponseStatus(org.springframework.http.HttpStatus.ACCEPTED)
    void create(
            @RequestHeader("X-Internal-Token") String token,
            @RequestBody MessageRequest request) {
        authorization.require(token);
        messaging.accept(request);
    }

    @GetMapping("/failed")
    List<OutboxMessage> failed(@RequestHeader("X-Internal-Token") String token) {
        authorization.require(token);
        return messaging.failedMessages();
    }

    @PostMapping("/{id}/retry")
    void retry(
            @RequestHeader("X-Internal-Token") String token,
            @PathVariable UUID id) {
        authorization.require(token);
        messaging.retryMessage(id);
    }

    @PostMapping("/scrub")
    void scrub(
            @RequestHeader("X-Internal-Token") String token,
            @RequestBody ScrubRequest request) {
        authorization.require(token);
        messaging.scrubMessages(request.correlationKey());
    }

    record ScrubRequest(String correlationKey) {
    }
}
