package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.domain.ImageFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.DataInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

final class ImageInput {
    private static final byte[] PNG_SIGNATURE = {(byte) 137, 80, 78, 71, 13, 10, 26, 10};

    private ImageInput() {
    }

    static ImageFormat inspect(Path path) throws IOException {
        try (var input = new DataInputStream(Files.newInputStream(path))) {
            byte[] signature = input.readNBytes(8);
            if (Arrays.equals(signature, PNG_SIGNATURE)) {
                inspectPng(input, Files.size(path) - 8);
                return ImageFormat.PNG;
            }
            if (signature.length >= 2 && (signature[0] & 255) == 255 && (signature[1] & 255) == 216) {
                inspectJpeg(path);
                return ImageFormat.JPEG;
            }
            throw invalid("Only JPEG and PNG images are supported");
        }
    }

    private static void inspectPng(DataInputStream input, long remaining) throws IOException {
        boolean ended = false;
        while (remaining >= 12) {
            long length = Integer.toUnsignedLong(input.readInt());
            var type = new String(input.readNBytes(4), StandardCharsets.US_ASCII);
            if (length > remaining - 12) throw invalid("Invalid PNG chunk");
            if (type.equals("acTL") || type.equals("fcTL") || type.equals("fdAT")) {
                throw invalid("Animated images are not supported");
            }
            input.skipNBytes(length + 4);
            remaining -= length + 12;
            if (type.equals("IEND")) {
                ended = length == 0 && remaining == 0;
                break;
            }
        }
        if (!ended) throw invalid("Invalid PNG image");
    }

    private static void inspectJpeg(Path path) throws IOException {
        try (var input = new DataInputStream(Files.newInputStream(path))) {
            input.readUnsignedShort();
            while (true) {
                if (input.readUnsignedByte() != 255) throw invalid("Invalid JPEG marker");
                int marker;
                do {
                    marker = input.readUnsignedByte();
                } while (marker == 255);
                if (marker == 0xDA) return; // Start of scan; the ImageIO reader validates compressed pixels.
                if (marker == 0xD9) throw invalid("JPEG has no image data");
                if (marker == 0x01 || marker >= 0xD0 && marker <= 0xD7) continue;
                int length = input.readUnsignedShort() - 2;
                if (length < 0) throw invalid("Invalid JPEG segment");
                var bytes = input.readNBytes(length);
                if (bytes.length != length) throw invalid("Truncated JPEG");
                if (marker == 0xE2 && length >= 4 && bytes[0] == 'M' && bytes[1] == 'P'
                        && bytes[2] == 'F' && bytes[3] == 0) throw invalid("Multiple-image files are not supported");
            }
        }
    }

    static ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
    }
}
