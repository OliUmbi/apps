package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.util.Comparator;
import java.util.UUID;

final class StorageFiles {
    private final Path root;

    StorageFiles(Path root) throws IOException {
        this.root = root.toAbsolutePath().normalize();
        Files.createDirectories(this.root);
        if (Files.isSymbolicLink(this.root))
            throw new IllegalArgumentException("Storage root must not be a symbolic link");
        checkPath(staging());
        Files.createDirectories(staging());
        for (var kind : AssetKind.values()) {
            checkPath(published(kind));
            Files.createDirectories(published(kind));
        }
    }

    Path staging() {
        return root.resolve("staging");
    }

    Path published(AssetKind kind) {
        return root.resolve(kind.directory());
    }

    Path directory(AssetKind kind, UUID id) {
        var name = id.toString();
        return root.resolve(kind.directory()).resolve(name.substring(0, 2)).resolve(name.substring(2, 4)).resolve(name);
    }

    void checkPath(Path path) {
        if (!path.normalize().startsWith(root) || path.equals(root)) {
            throw new IllegalArgumentException("Invalid storage path");
        }

        for (var current = path; current != null && current.startsWith(root); current = current.getParent()) {
            if (Files.isSymbolicLink(current)) {
                throw new IllegalArgumentException("Symbolic links are not allowed in storage");
            }
        }
    }

    void remove(Path directory) {
        checkPath(directory);

        if (!Files.exists(directory, LinkOption.NOFOLLOW_LINKS)) {
            return;
        }

        try (var paths = Files.walk(directory)) {
            for (var path : paths.sorted(Comparator.reverseOrder()).toList()) {
                checkPath(path);
                Files.deleteIfExists(path);
            }
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }
}
