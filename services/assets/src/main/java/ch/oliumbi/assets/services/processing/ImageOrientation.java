package ch.oliumbi.assets.services.processing;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.MetadataException;
import com.drew.metadata.exif.ExifIFD0Directory;

import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Path;

enum ImageOrientation {
    NORMAL, MIRROR_HORIZONTAL, ROTATE_180, MIRROR_VERTICAL,
    TRANSPOSE, ROTATE_90, TRANSVERSE, ROTATE_270;

    static ImageOrientation read(Path path) {
        try {
            var metadata = ImageMetadataReader.readMetadata(path.toFile());
            var exif = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (exif == null || !exif.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) return NORMAL;
            int value = exif.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            if (value < 1 || value > values().length) throw new InvalidImage("Invalid image orientation");
            return values()[value - 1]; // EXIF orientation is numbered 1 through 8.
        } catch (ImageProcessingException | MetadataException | IOException exception) {
            throw new InvalidImage("Image metadata could not be read", exception);
        }
    }

    // Always returns a new sRGB buffer; ownership of the source stays with the caller.
    BufferedImage apply(BufferedImage source) {
        int width = source.getWidth();
        int height = source.getHeight();
        boolean swapsAxes = switch (this) {
            case TRANSPOSE, ROTATE_90, TRANSVERSE, ROTATE_270 -> true;
            default -> false;
        };
        var result = new BufferedImage(swapsAxes ? height : width, swapsAxes ? width : height, source.getType());
        var graphics = result.createGraphics();
        try {
            graphics.drawImage(source, transform(width, height), null);
        } finally {
            graphics.dispose();
        }
        return result;
    }

    private AffineTransform transform(int width, int height) {
        return switch (this) {
            case NORMAL -> new AffineTransform();
            case MIRROR_HORIZONTAL -> new AffineTransform(-1, 0, 0, 1, width, 0);
            case ROTATE_180 -> new AffineTransform(-1, 0, 0, -1, width, height);
            case MIRROR_VERTICAL -> new AffineTransform(1, 0, 0, -1, 0, height);
            case TRANSPOSE -> new AffineTransform(0, 1, 1, 0, 0, 0);
            case ROTATE_90 -> new AffineTransform(0, 1, -1, 0, height, 0);
            case TRANSVERSE -> new AffineTransform(0, -1, -1, 0, height, width);
            case ROTATE_270 -> new AffineTransform(0, -1, 1, 0, 0, width);
        };
    }
}
