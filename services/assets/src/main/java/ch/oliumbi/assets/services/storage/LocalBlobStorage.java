package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.configurations.AssetsProperties;
import ch.oliumbi.assets.domain.AssetKind;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.nio.file.*;
import java.time.Clock;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;

@Slf4j
@Service
public class LocalBlobStorage implements BlobStorage {
    private final Path root;
    private final Clock clock;
    private final Duration grace;
    private final Set<UUID> active = ConcurrentHashMap.newKeySet();

    public LocalBlobStorage(AssetsProperties properties, Clock clock) throws IOException {
        this.root = properties.storageRoot().toAbsolutePath().normalize();
        this.clock = clock;
        this.grace = Duration.ofHours(properties.cleanupGraceHours());
        Files.createDirectories(root);
        if (Files.isSymbolicLink(root)) throw new IllegalArgumentException("Storage root must not be a symbolic link");
        Files.createDirectories(root.resolve("staging"));
        for (var kind : AssetKind.values()) Files.createDirectories(root.resolve(kind.directory()));
    }

    @Override
    public Upload stage(UUID id) {
        if (!active.add(id)) throw new IllegalStateException("Upload is already active");
        var directory = root.resolve("staging").resolve(id.toString());
        try {
            Files.createDirectory(directory);
        } catch (IOException exception) {
            active.remove(id);
            throw new UncheckedIOException(exception);
        }
        return new Upload() {
            public UUID id() {
                return id;
            }

            public Path directory() {
                return directory;
            }

            public void close() {
                try {
                    remove(directory);
                } catch (UncheckedIOException exception) {
                    log.warn("Staging cleanup failed for {}", id);
                } finally {
                    active.remove(id);
                }
            }
        };
    }

    @Override
    public Path upload(Upload upload, InputStream input, long maxBytes) {
        var destination = upload.directory().resolve("upload");
        try (input; var output = Files.newOutputStream(destination, StandardOpenOption.CREATE_NEW)) {
            byte[] buffer = new byte[8192];
            long total = 0;
            int count;
            while ((count = input.read(buffer)) != -1) {
                total += count;
                if (total > maxBytes)
                    throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Upload exceeds the size limit");
                output.write(buffer, 0, count);
            }
            if (total == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
            return destination;
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    @Override
    public void publish(Upload upload, AssetKind kind) {
        var destination = directory(kind, upload.id());
        try {
            Files.createDirectories(destination.getParent());
            checkPath(destination);
            Files.move(upload.directory(), destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    @Override
    public Path file(AssetKind kind, UUID id, String key) {
        if (!key.matches("[a-z0-9]+[.](jpg|png|pdf)")) throw new IllegalArgumentException("Invalid stored file key");
        var path = directory(kind, id).resolve(key);
        checkPath(path);
        if (!Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Asset bytes are unavailable");
        }
        return path;
    }

    @Override
    public void delete(AssetKind kind, UUID id) {
        remove(directory(kind, id));
    }

    @Override
    public void cleanup(AssetKind kind, Predicate<UUID> exists) {
        // Lazy traversal bounds memory; cap removals so one sweep does not monopolize disk IO.
        sweep(root.resolve(kind.directory()), 3, exists);
        sweep(root.resolve("staging"), 1, ignored -> false);
    }

    private void sweep(Path base, int depth, Predicate<UUID> exists) {
        var before = clock.instant().minus(grace);
        try (var paths = Files.walk(base, depth)) {
            var iterator = paths.filter(path -> base.relativize(path).getNameCount() == depth)
                    .filter(path -> Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)).iterator();
            int removed = 0;
            while (iterator.hasNext() && removed < 200) {
                var path = iterator.next();
                UUID id;
                try {
                    id = UUID.fromString(path.getFileName().toString());
                } catch (IllegalArgumentException ignored) {
                    continue;
                }
                if (active.contains(id) || !Files.getLastModifiedTime(path).toInstant().isBefore(before)) continue;
                if (!exists.test(id)) {
                    remove(path);
                    removed++;
                }
            }
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    private Path directory(AssetKind kind, UUID id) {
        var name = id.toString();
        return root.resolve(kind.directory()).resolve(name.substring(0, 2)).resolve(name.substring(2, 4)).resolve(name);
    }

    private void checkPath(Path path) {
        if (!path.normalize().startsWith(root) || path.equals(root))
            throw new IllegalArgumentException("Invalid storage path");
        for (var current = path; current != null && current.startsWith(root); current = current.getParent()) {
            if (Files.isSymbolicLink(current))
                throw new IllegalArgumentException("Symbolic links are not allowed in storage");
        }
    }

    private void remove(Path directory) {
        checkPath(directory);
        if (!Files.exists(directory, LinkOption.NOFOLLOW_LINKS)) return;
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
