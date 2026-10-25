package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.configurations.ImageProperties;
import ch.oliumbi.assets.domain.ImageRendition;
import ch.oliumbi.assets.domain.ImageSize;
import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.iptc.IptcDirectory;
import com.drew.metadata.xmp.XmpDirectory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static ch.oliumbi.assets.services.processing.ImageFixtures.PATTERN_HEIGHT;
import static ch.oliumbi.assets.services.processing.ImageFixtures.PATTERN_WIDTH;
import static ch.oliumbi.assets.services.processing.ImageFixtures.commentSegment;
import static ch.oliumbi.assets.services.processing.ImageFixtures.exifSegment;
import static ch.oliumbi.assets.services.processing.ImageFixtures.jpeg;
import static ch.oliumbi.assets.services.processing.ImageFixtures.jpegSegmentMarkers;
import static ch.oliumbi.assets.services.processing.ImageFixtures.mpfSegment;
import static ch.oliumbi.assets.services.processing.ImageFixtures.png;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngAnimationChunk;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngChunkTypes;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngExifChunk;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngTextChunk;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngTimeChunk;
import static ch.oliumbi.assets.services.processing.ImageFixtures.sourcePosition;
import static ch.oliumbi.assets.services.processing.ImageFixtures.swapsAxes;
import static ch.oliumbi.assets.services.processing.ImageFixtures.withChunksAfterIhdr;
import static ch.oliumbi.assets.services.processing.ImageFixtures.withSegmentsAfterSoi;
import static ch.oliumbi.assets.services.processing.ImageFixtures.xmpSegment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageProcessorTest {

    private static final ImageProperties PROPERTIES =
            new ImageProperties(20_971_520, 40_000_000, 12_000, 3072, 1);
    private static final int JPEG_COLOR_TOLERANCE = 60;

    @TempDir
    Path temporary;

    private List<ImageRendition> process(byte[] input, String asset) throws IOException {
        var directory = Files.createDirectories(temporary.resolve(asset));
        var upload = directory.resolve("upload");
        Files.write(upload, input);
        return new ImageProcessor(PROPERTIES).process(upload, directory);
    }

    private BufferedImage readImage(Path path) throws IOException {
        try (var input = Files.newInputStream(path)) {
            return ImageIO.read(input);
        }
    }

    @Test
    void jpegEncodeLeavesNoExifXmpOrCommentMetadata() throws IOException, ImageProcessingException {
        var input = withSegmentsAfterSoi(jpeg(), exifSegment(6), xmpSegment(), commentSegment());

        // The fixture must really carry source metadata for the assertions below to mean anything.
        var source = ImageMetadataReader.readMetadata(new ByteArrayInputStream(input));
        assertThat(source.getFirstDirectoryOfType(ExifIFD0Directory.class)).isNotNull();
        assertThat(source.getFirstDirectoryOfType(XmpDirectory.class)).isNotNull();
        assertThat(jpegSegmentMarkers(input)).contains(0xE1, 0xFE);

        process(input, "asset");

        try (var files = Files.list(temporary.resolve("asset"))) {
            var outputs = files.filter(path -> path.toString().endsWith(".jpg")).toList();
            assertThat(outputs).isNotEmpty();
            for (var output : outputs) {
                var bytes = Files.readAllBytes(output);
                assertThat(jpegSegmentMarkers(bytes))
                        .as(output.getFileName().toString())
                        .doesNotContain(0xE1, 0xE2, 0xED, 0xFE); // No EXIF, XMP, MPF, IPTC or comment segments.
                var metadata = ImageMetadataReader.readMetadata(new ByteArrayInputStream(bytes));
                assertThat(metadata.getFirstDirectoryOfType(ExifIFD0Directory.class)).as(output.getFileName().toString()).isNull();
                assertThat(metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class)).as(output.getFileName().toString()).isNull();
                assertThat(metadata.getFirstDirectoryOfType(XmpDirectory.class)).as(output.getFileName().toString()).isNull();
                assertThat(metadata.getFirstDirectoryOfType(IptcDirectory.class)).as(output.getFileName().toString()).isNull();
            }
        }
    }

    @Test
    void pngEncodeLeavesNoTextTimeOrExifMetadata() throws IOException, ImageProcessingException {
        var input = withChunksAfterIhdr(png(), pngTextChunk(), pngTimeChunk(), pngExifChunk(1));
        assertThat(pngChunkTypes(input)).contains("tEXt", "tIME", "eXIf");

        process(input, "asset");

        try (var files = Files.list(temporary.resolve("asset"))) {
            var outputs = files.filter(path -> path.toString().endsWith(".png")).toList();
            assertThat(outputs).isNotEmpty();
            for (var output : outputs) {
                assertThat(pngChunkTypes(Files.readAllBytes(output)))
                        .as(output.getFileName().toString())
                        .doesNotContain("tEXt", "zTXt", "iTXt", "tIME", "eXIf", "iCCP");
            }
        }
    }

    @Test
    void orientationMatrixIsAppliedToJpegImages() throws IOException {
        assertOrientationMatrix(false);
    }

    @Test
    void orientationMatrixIsAppliedToPngImages() throws IOException {
        assertOrientationMatrix(true);
    }

    @Test
    void pngProcessingPreservesTransparency() throws IOException {
        var image = new BufferedImage(PATTERN_WIDTH, PATTERN_HEIGHT, BufferedImage.TYPE_INT_ARGB);
        var transparent = new Color(0, 0, 255, 0).getRGB();
        var opaque = new Color(12, 34, 56).getRGB();
        for (int y = 0; y < PATTERN_HEIGHT; y++) {
            for (int x = 0; x < PATTERN_WIDTH; x++) {
                image.setRGB(x, y, x < PATTERN_WIDTH / 2 ? transparent : opaque);
            }
        }
        var input = ImageFixtures.encode(image, "png");

        process(input, "asset");

        var master = readImage(temporary.resolve("asset").resolve("master.png"));
        assertThat(master.getWidth()).isEqualTo(PATTERN_WIDTH);
        assertThat(master.getHeight()).isEqualTo(PATTERN_HEIGHT);
        assertThat(master.getRGB(4, 4) >>> 24).as("transparent area keeps alpha 0").isZero();
        assertThat(master.getRGB(28, 12)).as("opaque area keeps its exact color").isEqualTo(opaque);
    }

    @Test
    void animatedPngInputIsRejected() throws IOException {
        var input = withChunksAfterIhdr(png(), pngAnimationChunk());

        assertThatThrownBy(() -> process(input, "asset"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE));
    }

    @Test
    void multiPictureJpegInputIsRejected() throws IOException {
        var input = withSegmentsAfterSoi(jpeg(), mpfSegment());

        assertThatThrownBy(() -> process(input, "asset"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE));
    }

    @Test
    void clampedWidthsShareTheFirstGeneratedFile() throws IOException {
        // The 32px pattern is narrower than every preset, so all sizes clamp to the first generated file.
        var results = process(jpeg(), "asset");
        var variants = results.stream().filter(rendition -> rendition.size() != ImageSize.MASTER).toList();

        assertThat(variants).hasSize(ImageSize.values().length - 1);
        assertThat(variants).allSatisfy(rendition -> {
            assertThat(rendition.file().key()).isEqualTo("xs.jpg");
            assertThat(rendition.width()).isEqualTo(PATTERN_WIDTH);
        });
        try (var files = Files.list(temporary.resolve("asset"))) {
            assertThat(files.filter(path -> path.toString().endsWith(".jpg")).toList()).hasSize(2);
        }
    }

    @Test
    void processingDeletesTheRawUpload() throws IOException {
        var directory = Files.createDirectories(temporary.resolve("asset"));
        var upload = directory.resolve("upload");
        Files.write(upload, jpeg());

        new ImageProcessor(PROPERTIES).process(upload, directory);

        assertThat(Files.exists(upload)).isFalse();
    }

    private void assertOrientationMatrix(boolean png) throws IOException {
        for (int orientation = 1; orientation <= 8; orientation++) {
            var input = png
                    ? withChunksAfterIhdr(png(), pngExifChunk(orientation))
                    : withSegmentsAfterSoi(jpeg(), exifSegment(orientation));
            var asset = (png ? "png-" : "jpeg-") + orientation;
            process(input, asset);
            var master = readImage(temporary.resolve(asset).resolve(png ? "master.png" : "master.jpg"));
            var swaps = swapsAxes(orientation);

            assertThat(master.getWidth()).as("orientation %d width", orientation)
                    .isEqualTo(swaps ? PATTERN_HEIGHT : PATTERN_WIDTH);
            assertThat(master.getHeight()).as("orientation %d height", orientation)
                    .isEqualTo(swaps ? PATTERN_WIDTH : PATTERN_HEIGHT);
            for (int qx = 0; qx < 2; qx++) {
                for (int qy = 0; qy < 2; qy++) {
                    int x = master.getWidth() * qx / 2 + master.getWidth() / 4;
                    int y = master.getHeight() * qy / 2 + master.getHeight() / 4;
                    var source = sourcePosition(orientation, x, y, PATTERN_WIDTH, PATTERN_HEIGHT);
                    var expected = ImageFixtures.patternColor(source[0], source[1]).getRGB();
                    var description = "orientation " + orientation + " at (" + x + "," + y + ")";
                    if (png) {
                        assertThat(master.getRGB(x, y)).as(description).isEqualTo(expected);
                    } else {
                        assertColorWithinTolerance(master.getRGB(x, y), expected, description);
                    }
                }
            }
        }
    }

    private static void assertColorWithinTolerance(int actual, int expected, String description) {
        for (int shift = 0; shift <= 16; shift += 8) {
            assertThat(Math.abs(((actual >>> shift) & 0xFF) - ((expected >>> shift) & 0xFF)))
                    .as(description).isLessThanOrEqualTo(JPEG_COLOR_TOLERANCE);
        }
    }
}
