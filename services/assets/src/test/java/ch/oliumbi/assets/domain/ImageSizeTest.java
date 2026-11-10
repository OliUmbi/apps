package ch.oliumbi.assets.domain;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageSizeTest {

    private static final List<ImageSize> DERIVED =
            List.of(ImageSize.XS, ImageSize.SM, ImageSize.MD, ImageSize.LG, ImageSize.XL, ImageSize.XXL);

    @Test
    void everyWireValueResolvesToItsSize() {
        for (var size : ImageSize.values()) {
            assertThat(ImageSize.parse(size.value(), true)).isSameAs(size);
            if (size != ImageSize.MASTER) {
                assertThat(ImageSize.parse(size.value(), false)).isSameAs(size);
            }
        }
    }

    @Test
    void masterIsInternalOnly() {
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
    void derivedSizesKeepAPositiveWidthAndBudgetThatGrowWithTheSize() {
        assertThat(DERIVED.stream().map(ImageSize::width).toList()).isSorted().allSatisfy(width -> assertThat(width).isPositive());
        assertThat(DERIVED.stream().map(ImageSize::budgetBytes).toList())
                .isSorted().allSatisfy(budget -> assertThat(budget).isPositive());
    }

    @Test
    void masterIsTheOriginalWithoutAWidthOrBudget() {
        assertThat(ImageSize.MASTER.width()).isZero();
        assertThat(ImageSize.MASTER.budgetBytes()).isZero();
    }
}
