package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.configurations.ImageProperties;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.EOFException;
import java.io.IOException;
import java.nio.file.Path;

final class ImageDecoder {
    private final ImageProperties properties;

    ImageDecoder(ImageProperties properties) {
        this.properties = properties;
    }

    BufferedImage decode(Path upload) throws IOException {
        try (var input = ImageIO.createImageInputStream(upload.toFile())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new InvalidImage("Image could not be decoded");
            var reader = readers.next();
            try {
                reader.setInput(input);
                validateDimensions(reader.getWidth(0), reader.getHeight(0));
                if (reader.getNumImages(true) != 1) throw new InvalidImage("Multiple-image files are not supported");
                var decoded = reader.read(0);
                try {
                    return normalize(decoded);
                } finally {
                    decoded.flush();
                }
            } catch (IIOException | EOFException exception) {
                throw new InvalidImage("Image is corrupt or unsupported", exception);
            } finally {
                reader.dispose();
            }
        }
    }

    private void validateDimensions(int width, int height) {
        if (width < 1 || height < 1 || width > properties.maxSide() || height > properties.maxSide()
                || (long) width * height > properties.maxPixels()) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "Image dimensions exceed the limit");
        }
    }

    private BufferedImage normalize(BufferedImage decoded) {
        // A fresh sRGB buffer contains pixels only; never pass source metadata to a writer.
        var normalized = new BufferedImage(decoded.getWidth(), decoded.getHeight(),
                decoded.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        var graphics = normalized.createGraphics();
        try {
            graphics.drawImage(decoded, 0, 0, null);
        } finally {
            graphics.dispose();
        }
        return normalized;
    }
}
