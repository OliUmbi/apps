package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.configurations.ImageProperties;
import ch.oliumbi.assets.domain.ImageRendition;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.Semaphore;

@Service
public class ImageProcessor {
    private final ImageDecoder decoder;
    private final ImageRenditions renditions;
    private final Semaphore permits;

    public ImageProcessor(ImageProperties properties) {
        this.decoder = new ImageDecoder(properties);
        this.renditions = new ImageRenditions(properties.masterMaxSide());
        this.permits = new Semaphore(properties.concurrency());
    }

    public List<ImageRendition> process(Path upload, Path directory) {
        if (!permits.tryAcquire()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Image processor is busy. Try again.");
        }
        try {
            var format = ImageInput.inspect(upload);
            var orientation = ImageOrientation.read(upload);
            var decoded = decoder.decode(upload);
            try {
                var pixels = orientation == ImageOrientation.NORMAL ? decoded : orientation.apply(decoded);
                try {
                    var results = renditions.generate(pixels, format, directory);
                    Files.delete(upload);
                    return results;
                } finally {
                    if (pixels != decoded) pixels.flush();
                }
            } finally {
                decoded.flush();
            }
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        } finally {
            permits.release();
        }
    }
}
