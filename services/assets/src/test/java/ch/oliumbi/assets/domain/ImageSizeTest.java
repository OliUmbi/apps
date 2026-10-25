package ch.oliumbi.assets.domain;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageSizeTest {

    @Test
    void parsesThePublicSizes() {
        assertThat(ImageSize.parse("xs", false)).isEqualTo(ImageSize.XS);
        assertThat(ImageSize.parse("2xl", false)).isEqualTo(ImageSize.XXL);
    }

    @Test
    void masterIsInternalOnly() {
        assertThat(ImageSize.parse("master", true)).isEqualTo(ImageSize.MASTER);

        assertThatThrownBy(() -> ImageSize.parse("master", false))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void rejectsUnknownSizes() {
        assertThatThrownBy(() -> ImageSize.parse("huge", true))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void exposesWidthAndBudget() {
        assertThat(ImageSize.XL.width()).isEqualTo(1280);
        assertThat(ImageSize.XL.budgetBytes()).isEqualTo(240L * 1024);
        assertThat(ImageSize.MASTER.budgetBytes()).isZero();
    }
}
