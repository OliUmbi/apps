package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.UUID;

@Slf4j
final class StorageFiles {
    private final Path root;

    StorageFiles(Path root) throws IOException {
        this.root = root.toAbsolutePath().normalize();
        Files.createDirectories(this.root);
        if (isLink(this.root))
            throw new IllegalArgumentException("Storage root must not be a link");
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
            if (isLink(current)) {
                throw new IllegalArgumentException("Links are not allowed in storage");
            }
        }
    }

    /**
     * NTFS junctions are reparse points, but the JDK reports them as ordinary
     * directories instead of symbolic links ({@code isOther()} marks the reparse
     * point). Special files are rejected as well because they cannot be storage
     * entries either.
     */
    private static boolean isLink(Path path) {
        if (Files.isSymbolicLink(path)) {
            return true;
        }
        try {
            return Files.readAttributes(path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS).isOther();
        } catch (IOException exception) {
            // A path that does not exist yet cannot redirect anything.
            return false;
        }
    }

    void remove(Path directory) {
        checkPath(directory);

        if (!Files.exists(directory, LinkOption.NOFOLLOW_LINKS)) {
            return;
        }

        try {
            Files.walkFileTree(directory, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult preVisitDirectory(Path path, BasicFileAttributes attributes) {
                    // Junctions look like directories to the JDK; never descend into them.
                    if (isLink(path)) {
                        log.warn("Storage cleanup skipped {} (link)", path);
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFile(Path path, BasicFileAttributes attributes) {
                    delete(path);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFileFailed(Path path, IOException exception) {
                    log.warn("Storage cleanup skipped {} ({})", path, exception.getClass().getSimpleName());
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path path, IOException exception) {
                    delete(path);
                    return FileVisitResult.CONTINUE;
                }

                private void delete(Path path) {
                    try {
                        checkPath(path);
                        Files.deleteIfExists(path);
                    } catch (IOException | RuntimeException exception) {
                        // A stray link or an undeletable entry must not abort the rest of the cleanup
                        // or mask a primary exception when this runs from upload close.
                        log.warn("Storage cleanup skipped {} ({})", path, exception.getClass().getSimpleName());
                    }
                }
            });
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }
}
