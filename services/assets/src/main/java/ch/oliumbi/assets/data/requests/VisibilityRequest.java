package ch.oliumbi.assets.data.requests;

import jakarta.validation.constraints.NotNull;

public record VisibilityRequest(@NotNull Boolean visible) {
}