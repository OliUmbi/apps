package ch.oliumbi.messaging.data.responses;

import java.util.List;

// todo should probably go in a generic paginated response object (maybe even jpa pagination/sorting)
public record MessageHistoryResponse(
        List<MessageResponse> messages,
        int page,
        int size,
        long total) {
}
