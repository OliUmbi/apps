package ch.oliumbi.assets.services.processing;

import java.io.DataInputStream;
import java.io.IOException;
import java.util.Arrays;

final class JpegInspector {
    static final int START_OF_IMAGE = 0xFFD8;
    private static final int MARKER_PREFIX = 0xFF;
    private static final int START_OF_SCAN = 0xDA;
    private static final int END_OF_IMAGE = 0xD9;
    private static final int TEMPORARY = 0x01;
    private static final int FIRST_RESTART = 0xD0;
    private static final int LAST_RESTART = 0xD7;
    private static final int APPLICATION_2 = 0xE2;
    private static final int SEGMENT_LENGTH_BYTES = 2;
    private static final byte[] MULTI_PICTURE_SIGNATURE = {'M', 'P', 'F', 0};

    private JpegInspector() {
    }

    // Input is positioned immediately after the start-of-image marker.
    static void inspect(DataInputStream input) throws IOException {
        while (true) {
            int marker = readMarker(input);
            if (marker == START_OF_SCAN) return; // ImageIO handles the compressed scan.
            if (marker == END_OF_IMAGE) throw new InvalidImage("JPEG has no image data");
            if (marker == TEMPORARY || marker >= FIRST_RESTART && marker <= LAST_RESTART) continue;

            int length = input.readUnsignedShort() - SEGMENT_LENGTH_BYTES;
            if (length < 0) throw new InvalidImage("Invalid JPEG segment");
            if (marker == APPLICATION_2 && length >= MULTI_PICTURE_SIGNATURE.length) {
                var signature = input.readNBytes(MULTI_PICTURE_SIGNATURE.length);
                if (Arrays.equals(signature, MULTI_PICTURE_SIGNATURE)) {
                    throw new InvalidImage("Multiple-image files are not supported");
                }
                length -= signature.length;
            }
            input.skipNBytes(length);
        }
    }

    private static int readMarker(DataInputStream input) throws IOException {
        if (input.readUnsignedByte() != MARKER_PREFIX) throw new InvalidImage("Invalid JPEG marker");
        int marker;
        do {
            marker = input.readUnsignedByte();
        } while (marker == MARKER_PREFIX);
        if (marker == 0) throw new InvalidImage("Invalid JPEG marker");
        return marker;
    }
}
