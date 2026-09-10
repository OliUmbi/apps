package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.time.Clock;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;

final class OrphanCleanup {
    private static final int PUBLISHED_DIRECTORY_DEPTH = 3;
    private static final int STAGING_DIRECTORY_DEPTH = 1;
    private static final int MAX_REMOVALS = 200;

    private final StorageFiles files;
    private final Clock clock;
    private final Duration grace;
    private final Set<UUID> active;

    OrphanCleanup(StorageFiles files, Clock clock, Duration grace, Set<UUID> active) {
        this.files = files;
        this.clock = clock;
        this.grace = grace;
        this.active = active;
    }

    void cleanup(AssetKind kind, Predicate<UUID> metadataExists) {
        sweep(files.published(kind), PUBLISHED_DIRECTORY_DEPTH, metadataExists);
        sweep(files.staging(), STAGING_DIRECTORY_DEPTH, ignored -> false);
    }

    private void sweep(Path base, int depth, Predicate<UUID> metadataExists) {
        var before = clock.instant().minus(grace);

        try (var paths = Files.walk(base, depth)) {
            var iterator = paths.filter(path -> base.relativize(path).getNameCount() == depth)
                    .filter(path -> Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS))
                    .iterator();

            int removed = 0;
            while (iterator.hasNext() && removed < MAX_REMOVALS) {
                var path = iterator.next();
                UUID id;
                try {
                    id = UUID.fromString(path.getFileName().toString());
                } catch (IllegalArgumentException ignored) {
                    continue;
                }
                // Stage and close share this lock, so an upload cannot start between checking and removal.
                synchronized (active) {
                    if (active.contains(id) || !Files.getLastModifiedTime(path).toInstant().isBefore(before)) continue;
                    if (!metadataExists.test(id)) {
                        files.remove(path);
                        removed++;
                    }
                }
            }
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

}
