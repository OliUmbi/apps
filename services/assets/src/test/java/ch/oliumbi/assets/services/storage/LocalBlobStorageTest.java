package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.configurations.AssetsProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalBlobStorageTest {

    @TempDir
    Path temporary;

    private LocalBlobStorage storage() throws IOException {
        return new LocalBlobStorage(
                new AssetsProperties("token", temporary.resolve("media"), 52_428_800, 24, 3_600_000),
                Clock.systemUTC());
    }

    @Test
    void uploadStopsReadingOnceTheStreamingLimitIsExceeded() throws IOException {
        var storage = storage();
        try (var upload = storage.stage(UUID.randomUUID())) {
            assertThatThrownBy(() -> storage.upload(upload, new ByteArrayInputStream(new byte[64]), 16))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONTENT_TOO_LARGE));
        }
    }

    @Test
    void stagingCleanupFailureDoesNotEscapeClose() throws IOException {
        var storage = storage();
        var upload = storage.stage(UUID.randomUUID());
        var directory = upload.directory();
        var stuck = StuckEntries.create(directory);
        Files.writeString(directory.resolve("plain.txt"), "content");

        try {
            upload.close(); // must not throw

            assertThat(Files.exists(directory.resolve("plain.txt"))).isFalse();
            assertThat(Files.exists(stuck.resolve("child.txt"))).isTrue();
        } finally {
            StuckEntries.release(stuck);
        }
    }

    @Test
    void aPrimaryUploadFailureIsNotMaskedByStagingCleanup() throws IOException {
        var storage = storage();
        var upload = storage.stage(UUID.randomUUID());
        var stuck = StuckEntries.create(upload.directory());

        try {
            assertThatCode(() -> failDuring(upload))
                    .isInstanceOf(IllegalStateException.class).hasMessage("primary");
        } finally {
            StuckEntries.release(stuck);
        }
    }

    private static void failDuring(BlobStorage.Upload upload) {
        try (upload) {
            throw new IllegalStateException("primary");
        }
    }
}
