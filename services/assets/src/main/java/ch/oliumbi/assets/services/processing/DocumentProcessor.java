package ch.oliumbi.assets.services.processing;

import ch.oliumbi.assets.domain.StoredFile;
import ch.oliumbi.assets.services.storage.FileInspection;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

public final class DocumentProcessor {
    public static final String FILE_KEY = "original.pdf";
    public static final String CONTENT_TYPE = "application/pdf";
    private static final byte[] SIGNATURE = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private DocumentProcessor() {
    }

    public static StoredFile process(Path upload) throws IOException {
        try (var input = Files.newInputStream(upload)) {
            if (!Arrays.equals(input.readNBytes(SIGNATURE.length), SIGNATURE)) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF documents are supported");
            }
        }
        var output = upload.resolveSibling(FILE_KEY);
        Files.move(upload, output);
        return FileInspection.inspect(output, CONTENT_TYPE);
    }
}
