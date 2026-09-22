package ch.oliumbi.assets.data.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DocumentCreateRequest(
        @NotBlank @Size(max = 120) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
        Boolean visible) {
    public DocumentCreateRequest {
        visible = Boolean.TRUE.equals(visible);
    }
}
