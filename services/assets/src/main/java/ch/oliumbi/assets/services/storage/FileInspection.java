package ch.oliumbi.assets.services.storage;

import ch.oliumbi.assets.domain.StoredFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class FileInspection {
    private FileInspection() {
    }

    public static StoredFile inspect(Path path, String contentType) {
        try (var input = Files.newInputStream(path)) {
            var digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
            return new StoredFile(path.getFileName().toString(), contentType, Files.size(path),
                    HexFormat.of().formatHex(digest.digest()));
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
