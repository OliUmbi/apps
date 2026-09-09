package ch.oliumbi.messaging.data.responses;

import java.util.List;

public record MessageDetailResponse(MessageResponse message, List<MessageAttemptResponse> attempts) {
}
