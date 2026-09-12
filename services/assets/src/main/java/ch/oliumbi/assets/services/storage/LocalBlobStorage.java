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
import java.util.function.Predicate;

@Slf4j
@Service
public class LocalBlobStorage implements BlobStorage {
    private static final int COPY_BUFFER_BYTES = 8192;

    private final StorageFiles files;
    private final OrphanCleanup cleanup;
    private final Set<UUID> active = new HashSet<>();

    public LocalBlobStorage(AssetsProperties properties, Clock clock) throws IOException {
        this.files = new StorageFiles(properties.storageRoot());
        this.cleanup = new OrphanCleanup(files, clock, Duration.ofHours(properties.cleanupGraceHours()), active);
    }

    @Override
    public Upload stage(UUID id) {
        synchronized (active) {
            if (!active.add(id)) throw new IllegalStateException("Upload is already active");
            var directory = files.staging().resolve(id.toString());
            try {
                files.checkPath(directory);
                Files.createDirectory(directory);
                return new StagedUpload(id, directory);
            } catch (IOException exception) {
                active.remove(id);
                throw new UncheckedIOException(exception);
            } catch (RuntimeException exception) {
                active.remove(id);
                throw exception;
            }
        }
    }

    @Override
    public Path upload(Upload upload, InputStream input, long maxBytes) {
        var destination = upload.directory().resolve("upload");
        try (input; var output = Files.newOutputStream(destination, StandardOpenOption.CREATE_NEW)) {
            byte[] buffer = new byte[COPY_BUFFER_BYTES];
            long total = 0;
            int count;
            while ((count = input.read(buffer)) != -1) {
                total += count;
                if (total > maxBytes)
                    throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "Upload exceeds the size limit");
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
        var destination = files.directory(kind, upload.id());
        try {
            files.checkPath(destination);
            Files.createDirectories(destination.getParent());
            Files.move(upload.directory(), destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    @Override
    public Path file(AssetKind kind, UUID id, String key) {
        if (!key.matches("[a-z0-9]+[.](jpg|png|pdf)")) throw new IllegalArgumentException("Invalid stored file key");
        var path = files.directory(kind, id).resolve(key);
        files.checkPath(path);
        if (!Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Asset bytes are unavailable");
        }
        return path;
    }

    @Override
    public void delete(AssetKind kind, UUID id) {
        files.remove(files.directory(kind, id));
    }

    @Override
    public void cleanup(AssetKind kind, Predicate<UUID> metadataExists) {
        cleanup.cleanup(kind, metadataExists);
    }

    private final class StagedUpload implements Upload {
        private final UUID id;
        private final Path directory;
        private boolean closed;

        private StagedUpload(UUID id, Path directory) {
            this.id = id;
            this.directory = directory;
        }

        @Override
        public UUID id() {
            return id;
        }

        @Override
        public Path directory() {
            return directory;
        }

        @Override
        public void close() {
            synchronized (active) {
                if (closed) return;
                try {
                    files.remove(directory);
                } catch (UncheckedIOException exception) {
                    log.warn("Staging cleanup failed for {}", id, exception);
                } finally {
                    closed = true;
                    active.remove(id);
                }
            }
        }
    }
}
