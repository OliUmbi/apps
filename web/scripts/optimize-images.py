"""Generate responsive AVIF variants for a site's static photos.

    python web/scripts/optimize-images.py web/sites/zelglihof/public/images

Each JPEG stays as the fallback for browsers without AVIF; the generated
`<name>-480.avif`, `-800`, `-1200` and `-full` files are what `StaticImage`
puts in the `<picture>` srcset. Requires Pillow with AVIF support
(`pip install pillow`).
"""

import sys
from pathlib import Path

from PIL import Image

WIDTHS = (480, 800, 1200)
QUALITY = 60
SPEED = 6


def optimize(images: Path) -> None:
    for jpg in sorted(images.glob("*.jpg")):
        image = Image.open(jpg).convert("RGB")
        for width in WIDTHS:
            if width >= image.width:
                continue
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(
                jpg.with_name(f"{jpg.stem}-{width}.avif"),
                "AVIF",
                quality=QUALITY,
                speed=SPEED,
            )
        image.save(
            jpg.with_name(f"{jpg.stem}-full.avif"),
            "AVIF",
            quality=QUALITY,
            speed=SPEED,
        )
        print(f"{jpg.name}: {image.width}x{image.height}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    optimize(Path(sys.argv[1]))
