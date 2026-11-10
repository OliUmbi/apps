package ch.oliumbi.shared;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * The persistence suites disable themselves when {@code STUDIO_TEST_ADMIN_URL}
 * is absent so a plain local {@code mvn test} stays green. CI must never take
 * that path: it provisions and migrates a database, so a missing URL would
 * silently remove the only schema-validation step.
 */
class PersistenceEnvironmentTest {

    @Test
    void ciRequiresTheTestDatabaseUrl() {
        if (System.getenv("CI") == null) return;

        var url = System.getenv("STUDIO_TEST_ADMIN_URL");
        assertNotNull(url, "CI must set STUDIO_TEST_ADMIN_URL for the persistence suites");
        assertFalse(url.isBlank(), "CI must set STUDIO_TEST_ADMIN_URL for the persistence suites");
    }
}
