package ch.oliumbi.assets.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ImageSize {
    MASTER("master", 0, 0), XS("xs", 320, 35), SM("sm", 640, 80),
    MD("md", 768, 110), LG("lg", 1024, 170), XL("xl", 1280, 240), XXL("2xl", 1536, 330);

    private final String value;
    private final int width;
    private final int budgetKiB;

    ImageSize(String value, int width, int budgetKiB) {
        this.value = value;
        this.width = width;
        this.budgetKiB = budgetKiB;
    }

    public static ImageSize parse(String value, boolean internal) {
        for (var size : values()) {
            if (size.value.equals(value) && (internal || size != MASTER)) return size;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported image size");
    }

    public String value() {
        return value;
    }

    public int width() {
        return width;
    }

    public long budgetBytes() {
        return budgetKiB * 1024L;
    }
}
