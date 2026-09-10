package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.AssetKind;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.UUID;
import java.util.function.Predicate;

public interface BlobStorage {
    Upload stage(UUID id);

    Path upload(Upload upload, InputStream input, long maxBytes);

    void publish(Upload upload, AssetKind kind);

    Path file(AssetKind kind, UUID id, String key);

    void delete(AssetKind kind, UUID id);

    void cleanup(AssetKind kind, Predicate<UUID> metadataExists);

    interface Upload extends AutoCloseable {
        UUID id();

        Path directory();

        @Override
        void close();
    }
}
