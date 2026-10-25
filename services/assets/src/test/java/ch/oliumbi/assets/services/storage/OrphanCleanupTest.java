package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.configurations.AssetsProperties;
import ch.oliumbi.assets.domain.AssetKind;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class OrphanCleanupTest {

    private static final UUID IN_FLIGHT = UUID.fromString("11111111-2222-3333-4444-555555555555");

    @TempDir
    Path temporary;

    private final Set<UUID> active = new HashSet<>();

    private StorageFiles files() throws IOException {
        return new StorageFiles(temporary.resolve("media"));
    }

    private OrphanCleanup cleanup(StorageFiles files) {
        return new OrphanCleanup(files, Clock.systemUTC(), Duration.ofHours(1), active);
    }

    private Path stalePublished(StorageFiles files, UUID id) throws IOException {
        var path = files.directory(AssetKind.IMAGE, id);
        Files.createDirectories(path);
        Files.setLastModifiedTime(path, FileTime.from(Instant.now().minus(2, ChronoUnit.HOURS)));
        return path;
    }

    @Test
    void removesOrphansOlderThanTheGracePeriod() throws IOException {
        var files = files();
        var orphan = stalePublished(files, IN_FLIGHT);

        cleanup(files).cleanup(AssetKind.IMAGE, id -> false);

        assertThat(Files.exists(orphan)).isFalse();
    }

    @Test
    void keepsDirectoriesWithMetadata() throws IOException {
        var files = files();
        var directory = stalePublished(files, IN_FLIGHT);

        cleanup(files).cleanup(AssetKind.IMAGE, id -> true);

        assertThat(Files.exists(directory)).isTrue();
    }

    @Test
    void keepsDirectoriesInsideTheGracePeriod() throws IOException {
        var files = files();
        var directory = files.directory(AssetKind.IMAGE, IN_FLIGHT);
        Files.createDirectories(directory);

        cleanup(files).cleanup(AssetKind.IMAGE, id -> false);

        assertThat(Files.exists(directory)).isTrue();
    }

    @Test
    void keepsDirectoriesOfInFlightUploads() throws IOException {
        var files = files();
        var staging = Files.createDirectories(files.staging().resolve(IN_FLIGHT.toString()));
        Files.setLastModifiedTime(staging, FileTime.from(Instant.now().minus(2, ChronoUnit.HOURS)));
        active.add(IN_FLIGHT);

        cleanup(files).cleanup(AssetKind.IMAGE, id -> false);

        assertThat(Files.exists(staging)).isTrue();

        active.remove(IN_FLIGHT);
        cleanup(files).cleanup(AssetKind.IMAGE, id -> false);

        assertThat(Files.exists(staging)).isFalse();
    }

    @Test
    void uploadStagingIsNotBlockedWhileASweepChecksMetadata() throws Exception {
        var storage = new LocalBlobStorage(
                new AssetsProperties("token", temporary.resolve("media"), 52_428_800, 1, 3_600_000),
                Clock.systemUTC());
        var root = temporary.resolve("media");
        stalePublished(new StorageFiles(root), IN_FLIGHT);

        var entered = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        var pool = Executors.newCachedThreadPool();
        try {
            var sweep = pool.submit(() -> storage.cleanup(AssetKind.IMAGE, id -> {
                entered.countDown();
                try {
                    release.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
                return true;
            }));
            assertThat(entered.await(5, TimeUnit.SECONDS)).isTrue();

            var staging = pool.submit(() -> storage.stage(UUID.randomUUID()));
            assertThatCode(() -> staging.get(5, TimeUnit.SECONDS))
                    .as("upload staging must not wait for the sweep").doesNotThrowAnyException();

            release.countDown();
            assertThatCode(() -> sweep.get(5, TimeUnit.SECONDS)).doesNotThrowAnyException();
        } finally {
            release.countDown();
            pool.shutdownNow();
        }
    }

    @Test
    void boundsRemovalsPerRunAndFinishesOverSuccessiveRuns() throws IOException {
        var files = files();
        var sweep = cleanup(files);
        var orphans = IntStream.range(0, 250).mapToObj(index -> new UUID(0, index)).toList();
        for (var id : orphans) stalePublished(files, id);

        sweep.cleanup(AssetKind.IMAGE, id -> false);

        long remaining;
        try (var paths = Files.walk(files.published(AssetKind.IMAGE), 3)) {
            remaining = paths.filter(path -> files.published(AssetKind.IMAGE).relativize(path).getNameCount() == 3)
                    .filter(path -> Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)).count();
        }
        assertThat(remaining).isPositive().isLessThan(orphans.size());

        for (int run = 0; run < 4 && remaining > 0; run++) {
            sweep.cleanup(AssetKind.IMAGE, id -> false);
            try (var paths = Files.walk(files.published(AssetKind.IMAGE), 3)) {
                remaining = paths.filter(path -> files.published(AssetKind.IMAGE).relativize(path).getNameCount() == 3)
                        .filter(path -> Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)).count();
            }
        }

        assertThat(remaining).isZero();
    }

    @Test
    void resumesSoEveryCandidateIsExaminedAcrossRuns() throws IOException {
        var files = files();
        var sweep = cleanup(files);
        var candidates = IntStream.range(0, 250).mapToObj(index -> new UUID(0, index)).toList();
        for (var id : candidates) stalePublished(files, id);
        var examined = new HashSet<UUID>();
        var runs = new ArrayList<List<UUID>>();

        while (examined.size() < candidates.size() && runs.size() < 5) {
            var calls = new ArrayList<UUID>();
            runs.add(calls);
            sweep.cleanup(AssetKind.IMAGE, id -> {
                calls.add(id);
                examined.add(id);
                return true;
            });
        }

        assertThat(examined).containsAll(candidates);
        assertThat(runs).allSatisfy(calls ->
                assertThat(calls.size()).isLessThanOrEqualTo(OrphanCleanup.MAX_EXAMINED));
        assertThat(runs).hasSizeLessThanOrEqualTo(2);
    }

    @Test
    void examineOrderIsDeterministicAcrossRuns() throws IOException {
        var files = files();
        var sweep = cleanup(files);
        var candidates = IntStream.range(0, 250).mapToObj(index -> new UUID(0, index)).toList();
        for (var id : candidates) stalePublished(files, id);
        var first = new ArrayList<UUID>();
        var second = new ArrayList<UUID>();

        sweep.cleanup(AssetKind.IMAGE, id -> {
            first.add(id);
            return true;
        });
        sweep.cleanup(AssetKind.IMAGE, id -> {
            second.add(id);
            return true;
        });

        assertThat(first).isSortedAccordingTo(Comparator.comparing(UUID::toString));
        assertThat(first.size() + second.size()).isEqualTo(candidates.size());
    }
}
