package ch.oliumbi.assets.data.requests;

public record ImageCreateRequest(Boolean visible) {
    public ImageCreateRequest {
        visible = Boolean.TRUE.equals(visible);
    }
}
