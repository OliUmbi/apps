package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
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

    @Test
    void removeSkipsUnremovableEntriesAndStillRemovesTheRest() throws IOException {
        var files = files();
        var directory = files.directory(AssetKind.IMAGE, ID);
        Files.createDirectories(directory);
        Files.writeString(directory.resolve("plain.txt"), "content");
        var stuck = StuckEntries.create(directory);

        try {
            files.remove(directory); // must not throw

            assertThat(Files.exists(directory.resolve("plain.txt"))).isFalse();
            assertThat(Files.exists(stuck.resolve("child.txt"))).isTrue();
        } finally {
            StuckEntries.release(stuck);
        }
    }

    @Test
    void removeSkipsAStraySymbolicLinkAndStillRemovesTheRest() throws IOException {
        var files = files();
        var directory = files.directory(AssetKind.DOCUMENT, ID);
        Files.createDirectories(directory);
        Files.writeString(directory.resolve("file.txt"), "content");
        var outside = Files.createDirectories(temporary.resolve("outside"));
        var link = symbolicLink(directory.resolve("link"), outside);

        try {
            files.remove(directory); // must not throw

            assertThat(Files.exists(directory.resolve("file.txt"))).isFalse();
            assertThat(Files.exists(link, LinkOption.NOFOLLOW_LINKS)).isTrue();
            assertThat(Files.exists(outside)).isTrue();
        } finally {
            Files.deleteIfExists(link);
        }
    }

    private static Path symbolicLink(Path link, Path target) {
        try {
            return Files.createSymbolicLink(link, target);
        } catch (IOException | UnsupportedOperationException | SecurityException exception) {
            Assumptions.assumeTrue(false, "symbolic links cannot be created on this platform");
            return link;
        }
    }

    @Test
    @EnabledOnOs(OS.WINDOWS)
    void treatsAWindowsJunctionAsALink() throws IOException, InterruptedException {
        var files = files();
        var outside = Files.createDirectories(temporary.resolve("outside"));
        Files.writeString(outside.resolve("target.txt"), "outside");
        var junction = junction(temporary.resolve("junction"), outside);

        try {
            assertThatThrownBy(() -> files.checkPath(junction))
                    .isInstanceOf(IllegalArgumentException.class);
            assertThatThrownBy(() -> files.checkPath(junction.resolve("target.txt")))
                    .isInstanceOf(IllegalArgumentException.class);
            assertThatThrownBy(() -> new StorageFiles(junction))
                    .isInstanceOf(IllegalArgumentException.class);
        } finally {
            Files.deleteIfExists(junction);
        }
    }

    @Test
    @EnabledOnOs(OS.WINDOWS)
    void removeSkipsAWindowsJunctionAndLeavesTheOutsideTarget() throws IOException, InterruptedException {
        var files = files();
        var directory = files.directory(AssetKind.DOCUMENT, ID);
        Files.createDirectories(directory);
        Files.writeString(directory.resolve("file.txt"), "content");
        var outside = Files.createDirectories(temporary.resolve("outside"));
        Files.writeString(outside.resolve("target.txt"), "outside");
        var junction = junction(directory.resolve("junction"), outside);

        try {
            files.remove(directory); // must not throw

            assertThat(Files.exists(directory.resolve("file.txt"))).isFalse();
            assertThat(Files.exists(junction, LinkOption.NOFOLLOW_LINKS)).isTrue();
            assertThat(Files.exists(outside.resolve("target.txt"))).isTrue();
        } finally {
            Files.deleteIfExists(junction);
        }
    }

    private static Path junction(Path link, Path target) throws IOException, InterruptedException {
        var process = new ProcessBuilder("cmd", "/c", "mklink", "/J", link.toString(), target.toString())
                .redirectErrorStream(true)
                .start();
        var output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        if (process.waitFor() != 0 || !Files.exists(link, LinkOption.NOFOLLOW_LINKS)) {
            Assumptions.assumeTrue(false, "junctions cannot be created on this host: " + output.trim());
        }
        return link;
    }
}
