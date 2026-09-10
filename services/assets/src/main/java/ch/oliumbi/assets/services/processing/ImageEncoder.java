package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.domain.*;
import ch.oliumbi.assets.services.storage.FileInspection;

import javax.imageio.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

final class ImageEncoder {
    private static final float[] MASTER_QUALITIES = {0.90f};
    private static final float[] VARIANT_QUALITIES = {0.82f, 0.76f, 0.70f};

    ImageRendition write(BufferedImage pixels, ImageSize size, ImageFormat format, Path directory) throws IOException {
        var path = directory.resolve(size.value() + "." + format.extension());
        float[] qualities = size == ImageSize.MASTER ? MASTER_QUALITIES : VARIANT_QUALITIES;
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
