package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.domain.ImageFormat;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

final class ImageInput {
    private static final byte[] PNG_SIGNATURE = {(byte) 137, 80, 78, 71, 13, 10, 26, 10};

    private ImageInput() {
    }

    static ImageFormat inspect(Path path) throws IOException {
        try (var input = new DataInputStream(new BufferedInputStream(Files.newInputStream(path)))) {
            input.mark(PNG_SIGNATURE.length);
            byte[] signature = input.readNBytes(PNG_SIGNATURE.length);
            if (Arrays.equals(signature, PNG_SIGNATURE)) {
                PngInspector.inspect(input, Files.size(path) - PNG_SIGNATURE.length);
                return ImageFormat.PNG;
            }
            input.reset();
            if (signature.length >= Short.BYTES && input.readUnsignedShort() == JpegInspector.START_OF_IMAGE) {
                JpegInspector.inspect(input);
                return ImageFormat.JPEG;
            }
            throw new InvalidImage("Only JPEG and PNG images are supported");
        } catch (EOFException exception) {
            throw new InvalidImage("Image is truncated", exception);
        }
    }
}
