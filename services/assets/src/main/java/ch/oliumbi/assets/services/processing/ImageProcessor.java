package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.configurations.ImageProperties;
import ch.oliumbi.assets.domain.*;
import ch.oliumbi.assets.services.storage.FileInspection;
import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.exif.ExifIFD0Directory;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.Semaphore;

@Service
public class ImageProcessor {
    private final ImageProperties properties;
    private final Semaphore permits;

    public ImageProcessor(ImageProperties properties) {
        this.properties = properties;
        this.permits = new Semaphore(properties.concurrency());
    }

    public List<ImageRendition> process(Path upload, Path directory) {
        if (!permits.tryAcquire())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Image processor is busy. Try again.");
        try {
            var format = ImageInput.inspect(upload);
            var pixels = decode(upload);
            int orientation = orientation(upload);
            pixels = orient(pixels, orientation);
            var results = new ArrayList<ImageRendition>();
            var master = Thumbnails.of(pixels).size(Math.min(pixels.getWidth(), properties.masterMaxSide()),
                            Math.min(pixels.getHeight(), properties.masterMaxSide()))
                    .keepAspectRatio(true).asBufferedImage();
            results.add(write(master, ImageSize.MASTER, format, directory));
            var byWidth = new HashMap<Integer, ImageRendition>();
            for (var size : ImageSize.values()) {
                if (size == ImageSize.MASTER) continue;
                int width = Math.min(pixels.getWidth(), size.width());
                var existing = byWidth.get(width);
                if (existing != null) {
                    results.add(new ImageRendition(size, format, existing.width(), existing.height(), existing.file()));
                    continue;
                }
                int height = Math.max(1, (int) Math.round((double) pixels.getHeight() * width / pixels.getWidth()));
                var resized = Thumbnails.of(pixels).forceSize(width, height).asBufferedImage();
                var rendition = write(resized, size, format, directory);
                results.add(rendition);
                byWidth.put(width, rendition);
            }
            Files.delete(upload);
            return List.copyOf(results);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (EOFException exception) {
            throw ImageInput.invalid("Image is truncated");
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        } finally {
            permits.release();
        }
    }

    private BufferedImage decode(Path upload) throws IOException {
        try (var input = ImageIO.createImageInputStream(upload.toFile())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw ImageInput.invalid("Image could not be decoded");
            var reader = readers.next();
            try {
                reader.setInput(input);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || width > properties.maxSide() || height > properties.maxSide()
                        || (long) width * height > properties.maxPixels()) {
                    throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image dimensions exceed the limit");
                }
                if (reader.getNumImages(true) != 1) throw ImageInput.invalid("Multiple-image files are not supported");
                var decoded = reader.read(0);
                // A fresh sRGB buffer contains pixels only; never pass source metadata to a writer.
                var normalized = new BufferedImage(width, height,
                        decoded.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
                var graphics = normalized.createGraphics();
                try {
                    graphics.drawImage(decoded, 0, 0, null);
                } finally {
                    graphics.dispose();
                    decoded.flush();
                }
                return normalized;
            } catch (IIOException exception) {
                throw ImageInput.invalid("Image is corrupt or unsupported");
            } finally {
                reader.dispose();
            }
        }
    }

    private int orientation(Path path) {
        try {
            var metadata = ImageMetadataReader.readMetadata(path.toFile());
            var exif = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (exif == null || !exif.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) return 1;
            int orientation = exif.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            if (orientation < 1 || orientation > 8) throw ImageInput.invalid("Invalid image orientation");
            return orientation;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw ImageInput.invalid("Image metadata could not be read");
        }
    }

    private BufferedImage orient(BufferedImage source, int orientation) {
        if (orientation == 1) return source;
        int width = source.getWidth(), height = source.getHeight();
        var result = new BufferedImage(orientation >= 5 ? height : width, orientation >= 5 ? width : height, source.getType());
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int targetX = switch (orientation) {
                    case 2, 3 -> width - 1 - x;
                    case 5, 8 -> y;
                    case 6, 7 -> height - 1 - y;
                    default -> x;
                };
                int targetY = switch (orientation) {
                    case 3, 4 -> height - 1 - y;
                    case 5, 6 -> x;
                    case 7, 8 -> width - 1 - x;
                    default -> y;
                };
                result.setRGB(targetX, targetY, source.getRGB(x, y));
            }
        }
        source.flush();
        return result;
    }

    private ImageRendition write(BufferedImage pixels, ImageSize size, ImageFormat format, Path directory) throws IOException {
        var path = directory.resolve(size.value() + "." + format.extension());
        float[] qualities = size == ImageSize.MASTER ? new float[]{0.90f} : new float[]{0.82f, 0.76f, 0.70f};
        for (float quality : qualities) {
            encode(pixels, format, quality, path);
            if (format == ImageFormat.PNG || size == ImageSize.MASTER || Files.size(path) <= size.budgetBytes()) break;
        }
        return new ImageRendition(size, format, pixels.getWidth(), pixels.getHeight(), FileInspection.inspect(path, format.contentType()));
    }

    private void encode(BufferedImage pixels, ImageFormat format, float quality, Path path) throws IOException {
        var writers = ImageIO.getImageWritersByFormatName(format.extension());
        if (!writers.hasNext()) throw new IllegalStateException("Required image writer is missing");
        var writer = writers.next();
        try (var stream = Files.newOutputStream(path);
             var output = ImageIO.createImageOutputStream(stream)) {
            writer.setOutput(output);
            var parameters = writer.getDefaultWriteParam();
            if (parameters.canWriteCompressed()) {
                parameters.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                parameters.setCompressionQuality(format == ImageFormat.PNG ? 0f : quality);
            }
            writer.write(null, new IIOImage(pixels, null, null), parameters);
        } finally {
            writer.dispose();
        }
    }
}
