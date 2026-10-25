package ch.oliumbi.assets.services.processing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static ch.oliumbi.assets.services.processing.ImageFixtures.displayPosition;
import static ch.oliumbi.assets.services.processing.ImageFixtures.exifSegment;
import static ch.oliumbi.assets.services.processing.ImageFixtures.jpeg;
import static ch.oliumbi.assets.services.processing.ImageFixtures.png;
import static ch.oliumbi.assets.services.processing.ImageFixtures.pngExifChunk;
import static ch.oliumbi.assets.services.processing.ImageFixtures.withChunksAfterIhdr;
import static ch.oliumbi.assets.services.processing.ImageFixtures.withSegmentsAfterSoi;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageOrientationTest {

    private static final int WIDTH = 3;
    private static final int HEIGHT = 2;

    @TempDir
    Path temporary;

    private Path write(String name, byte[] bytes) throws IOException {
        return Files.write(temporary.resolve(name), bytes);
    }

    private static BufferedImage source() {
        var image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < HEIGHT; y++) {
            for (int x = 0; x < WIDTH; x++) {
                image.setRGB(x, y, new Color(x * 80 + 20, y * 120 + 30, 60).getRGB());
            }
        }
        return image;
    }

    @Test
    void readMapsEveryExifOrientationValueForJpegAndPng() throws IOException {
        for (int orientation = 1; orientation <= 8; orientation++) {
            var expected = ImageOrientation.values()[orientation - 1];
            var jpeg = write("orientation-" + orientation + ".jpg",
                    withSegmentsAfterSoi(jpeg(), exifSegment(orientation)));
            var png = write("orientation-" + orientation + ".png",
                    withChunksAfterIhdr(png(), pngExifChunk(orientation)));

            assertThat(ImageOrientation.read(jpeg)).as("jpeg orientation %d", orientation).isEqualTo(expected);
            assertThat(ImageOrientation.read(png)).as("png orientation %d", orientation).isEqualTo(expected);
        }
    }

    @Test
    void readTreatsImagesWithoutOrientationMetadataAsNormal() throws IOException {
        assertThat(ImageOrientation.read(write("plain.jpg", jpeg()))).isEqualTo(ImageOrientation.NORMAL);
        assertThat(ImageOrientation.read(write("plain.png", png()))).isEqualTo(ImageOrientation.NORMAL);
    }

    @Test
    void readRejectsOrientationValuesOutsideTheMatrix() throws IOException {
        var invalid = write("invalid.jpg", withSegmentsAfterSoi(jpeg(), exifSegment(9)));

        assertThatThrownBy(() -> ImageOrientation.read(invalid))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE));
    }

    @Test
    void applyTransformsThePixelMatrixTheExifStandardDescribes() {
        var source = source();

        for (int orientation = 1; orientation <= 8; orientation++) {
            var displayed = ImageOrientation.values()[orientation - 1].apply(source);
            var swaps = ImageFixtures.swapsAxes(orientation);

            assertThat(displayed.getWidth()).as("orientation %d width", orientation)
                    .isEqualTo(swaps ? HEIGHT : WIDTH);
            assertThat(displayed.getHeight()).as("orientation %d height", orientation)
                    .isEqualTo(swaps ? WIDTH : HEIGHT);
            for (int y = 0; y < HEIGHT; y++) {
                for (int x = 0; x < WIDTH; x++) {
                    var position = displayPosition(orientation, x, y, WIDTH, HEIGHT);
                    assertThat(displayed.getRGB(position[0], position[1]))
                            .as("orientation %d source (%d,%d)", orientation, x, y)
                            .isEqualTo(source.getRGB(x, y));
                }
            }
        }
    }

    @Test
    void applyReturnsAnIndependentBuffer() {
        var source = source();

        var displayed = ImageOrientation.ROTATE_90.apply(source);

        assertThat(displayed).isNotSameAs(source);
        // Source (0, 0) shows at (height - 1, 0) after a 90 degree rotation.
        assertThat(displayed.getRGB(HEIGHT - 1, 0)).isEqualTo(source.getRGB(0, 0));
        source.setRGB(0, 0, Color.BLACK.getRGB());
        assertThat(displayed.getRGB(HEIGHT - 1, 0)).isNotEqualTo(Color.BLACK.getRGB());
    }
}
