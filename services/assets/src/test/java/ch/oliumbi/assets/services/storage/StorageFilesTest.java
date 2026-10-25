package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StorageFilesTest {

    private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");

    @TempDir
    Path temporary;

    private StorageFiles files() throws IOException {
        return new StorageFiles(temporary.resolve("media"));
    }

    @Test
    void createsStagingAndPublishedDirectories() throws IOException {
        var files = files();

        assertThat(Files.isDirectory(files.staging())).isTrue();
        assertThat(Files.isDirectory(files.published(AssetKind.IMAGE))).isTrue();
        assertThat(Files.isDirectory(files.published(AssetKind.DOCUMENT))).isTrue();
    }

    @Test
    void nestsAssetDirectoriesByTheFirstTwoUuidSegments() throws IOException {
        var files = files();

        assertThat(files.directory(AssetKind.IMAGE, ID))
                .isEqualTo(files.published(AssetKind.IMAGE).resolve("11").resolve("11").resolve(ID.toString()));
    }

    @Test
    void refusesPathsOutsideTheStorageRoot() throws IOException {
        var files = files();
        var outside = temporary.resolve("outside");

        assertThatThrownBy(() -> files.checkPath(outside))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> files.checkPath(files.published(AssetKind.IMAGE).resolve("..").resolve("..")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> files.checkPath(temporary.resolve("media")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void removeDeletesATreeAndIgnoresMissingPaths() throws IOException {
        var files = files();
        var directory = files.directory(AssetKind.DOCUMENT, ID);
        Files.createDirectories(directory);
        Files.writeString(directory.resolve("file.txt"), "content");

        files.remove(directory);
        assertThat(Files.exists(directory)).isFalse();

        files.remove(directory);
    }
}
