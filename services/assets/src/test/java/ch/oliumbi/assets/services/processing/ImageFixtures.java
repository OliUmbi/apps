package ch.oliumbi.assets.services.processing;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.CRC32;
import javax.imageio.ImageIO;

/**
 * Deterministic image fixtures built in memory so the processing tests stay hermetic.
 * The JPEG EXIF segment and the PNG chunks are byte-crafted because no writer on the
 * classpath emits them for plain pixel buffers.
 */
final class ImageFixtures {
    static final int PATTERN_WIDTH = 32;
    static final int PATTERN_HEIGHT = 16;
    private static final int PNG_SIGNATURE_BYTES = 8;
    private static final int PNG_IHDR_CHUNK_BYTES = 25; // Length, type, data and CRC of the header chunk.

    private ImageFixtures() {
    }

    static BufferedImage pattern() {
        var image = new BufferedImage(PATTERN_WIDTH, PATTERN_HEIGHT, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < PATTERN_HEIGHT; y++) {
            for (int x = 0; x < PATTERN_WIDTH; x++) {
                image.setRGB(x, y, patternColor(x, y).getRGB());
            }
        }
        return image;
    }

    static Color patternColor(int x, int y) {
        if (x < PATTERN_WIDTH / 2) return y < PATTERN_HEIGHT / 2 ? Color.RED : Color.BLUE;
        return y < PATTERN_HEIGHT / 2 ? Color.GREEN : Color.YELLOW;
    }

    static byte[] jpeg() throws IOException {
        return encode(pattern(), "jpg");
    }

    static byte[] png() throws IOException {
        return encode(pattern(), "png");
    }

    static byte[] encode(BufferedImage image, String format) throws IOException {
        var output = new ByteArrayOutputStream();
        if (!ImageIO.write(image, format, output)) throw new IllegalStateException("Required image writer is missing");
        return output.toByteArray();
    }

    static byte[] withSegmentsAfterSoi(byte[] jpeg, byte[]... segments) {
        var output = new ByteArrayOutputStream();
        output.write(jpeg[0]);
        output.write(jpeg[1]);
        for (var segment : segments) output.writeBytes(segment);
        output.write(jpeg, 2, jpeg.length - 2);
        return output.toByteArray();
    }

    static byte[] withChunksAfterIhdr(byte[] png, byte[]... chunks) {
        var output = new ByteArrayOutputStream();
        output.write(png, 0, PNG_SIGNATURE_BYTES + PNG_IHDR_CHUNK_BYTES);
        for (var chunk : chunks) output.writeBytes(chunk);
        output.write(png, PNG_SIGNATURE_BYTES + PNG_IHDR_CHUNK_BYTES,
                png.length - PNG_SIGNATURE_BYTES - PNG_IHDR_CHUNK_BYTES);
        return output.toByteArray();
    }

    static byte[] exifSegment(int orientation) {
        var payload = new ByteArrayOutputStream();
        payload.writeBytes("Exif\0\0".getBytes(StandardCharsets.US_ASCII));
        payload.writeBytes(tiffOrientation(orientation));
        return jpegSegment(0xE1, payload.toByteArray());
    }

    static byte[] xmpSegment() {
        var body = "http://ns.adobe.com/xap/1.0/\0<?xpacket begin=\"\uFEFF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?>"
                + "<x:xmpmeta xmlns:x=\"adobe:ns:meta/\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">"
                + "<rdf:Description rdf:about=\"\"/></rdf:RDF></x:xmpmeta><?xpacket end=\"w\"?>";
        return jpegSegment(0xE1, body.getBytes(StandardCharsets.UTF_8));
    }

    static byte[] commentSegment() {
        return jpegSegment(0xFE, "golden comment".getBytes(StandardCharsets.UTF_8));
    }

    static byte[] mpfSegment() {
        var payload = new ByteArrayOutputStream();
        payload.writeBytes("MPF\0".getBytes(StandardCharsets.US_ASCII));
        payload.writeBytes(new byte[]{0, 0, 0, 0});
        return jpegSegment(0xE2, payload.toByteArray());
    }

    static byte[] pngExifChunk(int orientation) {
        return pngChunk("eXIf", tiffOrientation(orientation));
    }

    static byte[] pngTextChunk() {
        return pngChunk("tEXt", "Comment\0golden text".getBytes(StandardCharsets.ISO_8859_1));
    }

    static byte[] pngTimeChunk() {
        return pngChunk("tIME", new byte[]{0x07, (byte) 0xE7, 1, 2, 3, 4, 5});
    }

    static byte[] pngAnimationChunk() {
        return pngChunk("acTL", new byte[]{0, 0, 0, 1, 0, 0, 0, 0});
    }

    static List<Integer> jpegSegmentMarkers(byte[] jpeg) {
        var markers = new ArrayList<Integer>();
        int index = 2;
        while (index + 1 < jpeg.length) {
            int marker = jpeg[index + 1] & 0xFF;
            if (marker == 0xD9 || marker == 0xDA) break; // End of image or start of the scan.
            if (marker == 0x01 || marker >= 0xD0 && marker <= 0xD7) {
                index += 2;
                continue;
            }
            markers.add(marker);
            int length = ((jpeg[index + 2] & 0xFF) << 8) | (jpeg[index + 3] & 0xFF);
            index += 2 + length;
        }
        return markers;
    }

    static List<String> pngChunkTypes(byte[] png) {
        var types = new ArrayList<String>();
        int index = PNG_SIGNATURE_BYTES;
        while (index + 8 <= png.length) {
            int length = ((png[index] & 0xFF) << 24) | ((png[index + 1] & 0xFF) << 16)
                    | ((png[index + 2] & 0xFF) << 8) | (png[index + 3] & 0xFF);
            types.add(new String(png, index + 4, 4, StandardCharsets.US_ASCII));
            index += 12 + length;
        }
        return types;
    }

    /**
     * Position of the source pixel (x, y) after the EXIF orientation is displayed,
     * for a source image of the given dimensions. Mirrors the EXIF orientation matrix.
     */
    static int[] displayPosition(int orientation, int x, int y, int width, int height) {
        return switch (orientation) {
            case 1 -> new int[]{x, y};
            case 2 -> new int[]{width - 1 - x, y};
            case 3 -> new int[]{width - 1 - x, height - 1 - y};
            case 4 -> new int[]{x, height - 1 - y};
            case 5 -> new int[]{y, x};
            case 6 -> new int[]{height - 1 - y, x};
            case 7 -> new int[]{height - 1 - y, width - 1 - x};
            case 8 -> new int[]{y, width - 1 - x};
            default -> throw new IllegalArgumentException("Unknown orientation");
        };
    }

    /** Inverse of {@link #displayPosition}: the source pixel shown at a displayed position. */
    static int[] sourcePosition(int orientation, int x, int y, int width, int height) {
        return switch (orientation) {
            case 1 -> new int[]{x, y};
            case 2 -> new int[]{width - 1 - x, y};
            case 3 -> new int[]{width - 1 - x, height - 1 - y};
            case 4 -> new int[]{x, height - 1 - y};
            case 5 -> new int[]{y, x};
            case 6 -> new int[]{y, height - 1 - x};
            case 7 -> new int[]{width - 1 - y, height - 1 - x};
            case 8 -> new int[]{width - 1 - y, x};
            default -> throw new IllegalArgumentException("Unknown orientation");
        };
    }

    static boolean swapsAxes(int orientation) {
        return orientation >= 5;
    }

    private static byte[] tiffOrientation(int orientation) {
        var output = new ByteArrayOutputStream();
        output.writeBytes(new byte[]{0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00}); // Little-endian TIFF header.
        output.writeBytes(new byte[]{0x01, 0x00}); // One IFD entry.
        output.writeBytes(new byte[]{0x12, 0x01}); // Orientation tag.
        output.writeBytes(new byte[]{0x03, 0x00}); // SHORT.
        output.writeBytes(new byte[]{0x01, 0x00, 0x00, 0x00});
        output.writeBytes(new byte[]{(byte) orientation, 0x00, 0x00, 0x00});
        output.writeBytes(new byte[]{0x00, 0x00, 0x00, 0x00}); // No further IFDs.
        return output.toByteArray();
    }

    private static byte[] jpegSegment(int marker, byte[] payload) {
        var segment = new byte[4 + payload.length];
        segment[0] = (byte) 0xFF;
        segment[1] = (byte) marker;
        int length = payload.length + 2;
        segment[2] = (byte) (length >>> 8);
        segment[3] = (byte) length;
        System.arraycopy(payload, 0, segment, 4, payload.length);
        return segment;
    }

    private static byte[] pngChunk(String type, byte[] data) {
        var checksum = new CRC32();
        checksum.update(type.getBytes(StandardCharsets.US_ASCII));
        checksum.update(data);
        long crc = checksum.getValue();
        var output = new ByteArrayOutputStream();
        output.write(data.length >>> 24);
        output.write(data.length >>> 16);
        output.write(data.length >>> 8);
        output.write(data.length);
        output.writeBytes(type.getBytes(StandardCharsets.US_ASCII));
        output.writeBytes(data);
        output.write((int) (crc >>> 24));
        output.write((int) (crc >>> 16));
        output.write((int) (crc >>> 8));
        output.write((int) crc);
        return output.toByteArray();
    }
}
