package ch.oliumbi.assets.services.processing;

import java.io.DataInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

final class PngInspector {
    private static final int CHUNK_OVERHEAD_BYTES = 12; // Length, type and CRC.
    private static final int CHUNK_TYPE_BYTES = 4;
    private static final int CRC_BYTES = 4;
    private static final Set<String> ANIMATION_CHUNKS = Set.of("acTL", "fcTL", "fdAT");

    private PngInspector() {
    }

    // Also rejects animation chunks that a still-image reader would ignore.
    static void inspect(DataInputStream input, long remaining) throws IOException {
        while (remaining >= CHUNK_OVERHEAD_BYTES) {
            long length = Integer.toUnsignedLong(input.readInt());
            var type = new String(input.readNBytes(CHUNK_TYPE_BYTES), StandardCharsets.US_ASCII);
            if (length > remaining - CHUNK_OVERHEAD_BYTES) {
                throw new InvalidImage("Invalid PNG chunk");
            }
            if (ANIMATION_CHUNKS.contains(type)) {
                throw new InvalidImage("Animated images are not supported");
            }
            input.skipNBytes(length + CRC_BYTES);
            remaining -= length + CHUNK_OVERHEAD_BYTES;
            if (type.equals("IEND")) {
                if (length != 0 || remaining != 0) throw new InvalidImage("Invalid PNG image");
                return;
            }
        }
        throw new InvalidImage("Invalid PNG image");
    }
}
