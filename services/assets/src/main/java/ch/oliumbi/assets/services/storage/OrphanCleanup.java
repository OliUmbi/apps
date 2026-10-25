package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;

final class OrphanCleanup {
    private static final int PUBLISHED_DIRECTORY_DEPTH = 3;
    private static final int STAGING_DIRECTORY_DEPTH = 1;
    // Work bounds per run; the cursor below resumes the scan on the next run.
    static final int MAX_EXAMINED = 200;
    static final int MAX_REMOVALS = 200;

    private final StorageFiles files;
    private final Clock clock;
    private final Duration grace;
    private final Set<UUID> active;
    // Last examined candidate name per base directory. Runs resume after it, so bounded runs still
    // cover every candidate over successive runs instead of starving the tail of the tree.
    private final Map<Path, String> cursor = new HashMap<>();

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

        // Snapshot the candidates first: uploads must never wait for scanning, metadata checks or deletions.
        List<Candidate> candidates;
        try (var paths = Files.walk(base, depth)) {
            candidates = paths.filter(path -> base.relativize(path).getNameCount() == depth)
                    .filter(path -> Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS))
                    .map(OrphanCleanup::candidate)
                    .filter(candidate -> candidate != null)
                    .filter(candidate -> isOlderThan(candidate, before))
                    .sorted(Comparator.comparing(candidate -> candidate.id.toString()))
                    .toList();
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
        if (candidates.isEmpty()) return;

        var start = resumeIndex(base, candidates);
        int examined = 0;
        int removed = 0;
        while (start + examined < candidates.size() && examined < MAX_EXAMINED && removed < MAX_REMOVALS) {
            var candidate = candidates.get(start + examined);
            examined++;
            cursor.put(base, candidate.id.toString());
            if (metadataExists.test(candidate.id)) continue;
            // stage() cannot adopt an existing directory (it creates a fresh one), so re-checking the
            // active uploads here, at the delete decision only, keeps the protection without the lock.
            synchronized (active) {
                if (active.contains(candidate.id)) continue;
            }
            files.remove(candidate.path);
            removed++;
        }
        if (start + examined >= candidates.size()) cursor.remove(base);
    }

    private int resumeIndex(Path base, List<Candidate> candidates) {
        var resume = cursor.get(base);
        if (resume == null) return 0;
        for (int index = 0; index < candidates.size(); index++) {
            if (candidates.get(index).id.toString().compareTo(resume) > 0) return index;
        }
        return 0; // The previous run finished the cycle; start again at the front.
    }

    private static Candidate candidate(Path path) {
        try {
            return new Candidate(path, UUID.fromString(path.getFileName().toString()));
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private boolean isOlderThan(Candidate candidate, Instant before) {
        try {
            return Files.getLastModifiedTime(candidate.path).toInstant().isBefore(before);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    private record Candidate(Path path, UUID id) {
    }
}
