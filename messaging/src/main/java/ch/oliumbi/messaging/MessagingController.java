package ch.oliumbi.messaging;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/messages")
class MessagingController {
    private final OutboxRepository outbox;
    private final InternalAuthorization authorization;

    MessagingController(OutboxRepository outbox, InternalAuthorization authorization) {
        this.outbox = outbox;
        this.authorization = authorization;
    }

    @GetMapping("/failed")
    List<OutboxMessage> failed(@RequestHeader("X-Internal-Token") String token) {
        authorization.require(token);
        return outbox.failed();
    }

    @PostMapping("/{id}/retry")
    void retry(
            @RequestHeader("X-Internal-Token") String token,
            @PathVariable UUID id) {
        authorization.require(token);
        outbox.retry(id);
    }

    @PostMapping("/scrub")
    void scrub(
            @RequestHeader("X-Internal-Token") String token,
            @RequestBody ScrubRequest request) {
        authorization.require(token);
        outbox.scrub(request.correlationKey());
    }

    record ScrubRequest(String correlationKey) {
    }
}
