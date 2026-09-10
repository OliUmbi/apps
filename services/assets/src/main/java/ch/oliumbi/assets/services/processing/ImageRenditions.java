package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.domain.*;
import net.coobird.thumbnailator.Thumbnails;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

final class ImageRenditions {
    private final int masterMaxSide;
    private final ImageEncoder encoder = new ImageEncoder();

    ImageRenditions(int masterMaxSide) {
        this.masterMaxSide = masterMaxSide;
    }

    List<ImageRendition> generate(BufferedImage pixels, ImageFormat format, Path directory) throws IOException {
        var results = new ArrayList<ImageRendition>();
        results.add(master(pixels, format, directory));
        var byWidth = new HashMap<Integer, ImageRendition>();
        for (var size : ImageSize.values()) {
            if (size == ImageSize.MASTER) continue;
            int width = Math.min(pixels.getWidth(), size.width());
            var rendition = byWidth.get(width);
            if (rendition == null) {
                int height = Math.max(1, (int) Math.round((double) pixels.getHeight() * width / pixels.getWidth()));
                rendition = resize(pixels, width, height, size, format, directory);
                byWidth.put(width, rendition);
            }
            results.add(new ImageRendition(size, format, rendition.width(), rendition.height(), rendition.file()));
        }
        return List.copyOf(results);
    }

    private ImageRendition master(BufferedImage pixels, ImageFormat format, Path directory) throws IOException {
        var master = Thumbnails.of(pixels)
                .size(Math.min(pixels.getWidth(), masterMaxSide), Math.min(pixels.getHeight(), masterMaxSide))
                .keepAspectRatio(true).asBufferedImage();
        try {
            return encoder.write(master, ImageSize.MASTER, format, directory);
        } finally {
            master.flush();
        }
    }

    private ImageRendition resize(BufferedImage pixels, int width, int height, ImageSize size,
                                  ImageFormat format, Path directory) throws IOException {
        var resized = Thumbnails.of(pixels).forceSize(width, height).asBufferedImage();
        try {
            return encoder.write(resized, size, format, directory);
        } finally {
            resized.flush();
        }
    }
}
