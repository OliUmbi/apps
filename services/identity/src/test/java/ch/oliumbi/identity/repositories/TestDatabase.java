package ch.oliumbi.identity.repositories;

import org.springframework.test.context.DynamicPropertyRegistry;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Points a {@code @DataJpaTest} slice at the migrated PostgreSQL database
 * instead of an embedded one. The schema is Flyway's, so Hibernate only
 * validates it ({@code ddl-auto=validate}) and Flyway stays disabled.
 */
final class TestDatabase {

    private TestDatabase() {
    }

    static void register(DynamicPropertyRegistry registry) {
        var raw = Optional.ofNullable(System.getenv("STUDIO_TEST_ADMIN_URL"))
                .filter(value -> !value.isBlank())
                .orElseThrow(() -> new IllegalStateException("STUDIO_TEST_ADMIN_URL is not set"));

        var uri = URI.create(raw);
        var userInfo = Optional.ofNullable(uri.getUserInfo()).orElse("");
        var separator = userInfo.indexOf(':');
        var user = decode(separator < 0 ? userInfo : userInfo.substring(0, separator));
        var password = decode(separator < 0 ? "" : userInfo.substring(separator + 1));
        var port = uri.getPort() < 0 ? 5432 : uri.getPort();

        registry.add("spring.datasource.url",
                () -> "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath());
        registry.add("spring.datasource.username", () -> user);
        registry.add("spring.datasource.password", () -> password);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "false");
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
