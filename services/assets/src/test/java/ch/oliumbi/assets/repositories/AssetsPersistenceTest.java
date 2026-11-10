package ch.oliumbi.assets.repositories;

import ch.oliumbi.assets.data.entities.Document;
import ch.oliumbi.assets.data.entities.Image;
import ch.oliumbi.assets.domain.ImageFormat;
import ch.oliumbi.assets.domain.ImageRendition;
import ch.oliumbi.assets.domain.ImageSize;
import ch.oliumbi.assets.domain.StoredFile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The narrow PostgreSQL suite for assets: the visibility queries and the
 * image/variant cascade, with {@code ddl-auto=validate} proving the entity
 * mapping against the migrated schema at context startup.
 *
 * Disabled without {@code STUDIO_TEST_ADMIN_URL}; CI migrates a database and
 * sets it (see documentation/development/verification.md).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "STUDIO_TEST_ADMIN_URL", matches = ".+")
class AssetsPersistenceTest {

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        TestDatabase.register(registry);
    }

    @Autowired
    private ImageRepository images;

    @Autowired
    private ImageVariantRepository variants;

    @Autowired
    private DocumentRepository documents;

    private final PageRequest page = PageRequest.of(0, 20);

    @Test
    void publicImageReadsSeeOnlyVisibleRowsWhileSiteReadsSeeAll() {
        var visible = UUID.randomUUID();
        var hidden = UUID.randomUUID();
        images.saveAndFlush(new Image(visible, "zelglihof", true));
        images.saveAndFlush(new Image(hidden, "zelglihof", false));

        assertThat(images.findByIdAndVisibleTrue(visible)).isPresent();
        assertThat(images.findByIdAndVisibleTrue(hidden)).isEmpty();
        assertThat(images.findByIdAndSite(hidden, "zelglihof")).isPresent();
        assertThat(images.findBySite("zelglihof", page)).hasSize(2);
        assertThat(images.findBySiteAndVisible("zelglihof", true, page))
                .singleElement().extracting(Image::getId).isEqualTo(visible);
    }

    @Test
    void variantsPersistWithTheirImageAndDisappearWithIt() {
        var id = UUID.randomUUID();
        var image = new Image(id, "zelglihof", true);
        image.addVariant(new ImageRendition(ImageSize.XL, ImageFormat.JPEG, 4, 2,
                new StoredFile("xl.jpg", "image/jpeg", 3, "abc")));
        // Image assigns its id itself, so save() merges and returns the managed copy.
        var saved = images.saveAndFlush(image);

        assertThat(variants.findByImageIdAndSize(id, ImageSize.XL)).isPresent();

        images.delete(saved);
        images.flush();

        assertThat(variants.findByImageIdAndSize(id, ImageSize.XL)).isEmpty();
    }

    @Test
    void publicDocumentReadsRequireBothTheSlugAndVisibility() {
        var visible = UUID.randomUUID();
        documents.saveAndFlush(new Document(visible, "zelglihof", true, "visible-doc", 3, "abc"));
        documents.saveAndFlush(new Document(UUID.randomUUID(), "zelglihof", false, "hidden-doc", 3, "abc"));

        assertThat(documents.findBySlugAndVisibleTrue("visible-doc")).isPresent();
        assertThat(documents.findBySlugAndVisibleTrue("hidden-doc")).isEmpty();
        assertThat(documents.findBySiteAndVisible("zelglihof", false, page))
                .singleElement().extracting(Document::getSlug).isEqualTo("hidden-doc");
    }
}
