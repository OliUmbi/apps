package ch.oliumbi.assets.services.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Builds a tree entry that cannot be deleted on Windows (read-only file) nor on
 * POSIX (no write permission on its parent directory), so cleanup tests can
 * exercise the skip-and-continue path on any platform.
 */
final class StuckEntries {

    private StuckEntries() {
    }

    static Path create(Path parent) throws IOException {
        var directory = Files.createDirectories(parent.resolve("stuck"));
        var child = directory.resolve("child.txt");
        Files.writeString(child, "content");
        child.toFile().setWritable(false, false);
        directory.toFile().setWritable(false, false);
        return directory;
    }

    static void release(Path directory) throws IOException {
        directory.toFile().setWritable(true, false);
        directory.resolve("child.txt").toFile().setWritable(true, false);
    }
}
