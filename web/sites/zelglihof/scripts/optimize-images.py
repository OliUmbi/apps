"""Regenerate the AVIF variants for the owner photos.

Run from `web/sites/zelglihof` after adding or replacing a JPEG in
`public/images`:

    python scripts/optimize-images.py

Requires Pillow with AVIF support (`pip install pillow`). The JPEG stays as the
fallback for browsers without AVIF; `StaticImage` picks the variants from the
widths below.
"""

from pathlib import Path

from PIL import Image

WIDTHS = (480, 800, 1200)
QUALITY = 60
SPEED = 6

images = Path(__file__).resolve().parent.parent / "public" / "images"

for jpg in sorted(images.glob("*.jpg")):
    image = Image.open(jpg).convert("RGB")
    for width in WIDTHS:
        if width >= image.width:
            continue
        height = round(image.height * width / image.width)
        image.resize((width, height), Image.Resampling.LANCZOS).save(
            jpg.with_name(f"{jpg.stem}-{width}.avif"), "AVIF", quality=QUALITY, speed=SPEED
        )
    image.save(jpg.with_name(f"{jpg.stem}-full.avif"), "AVIF", quality=QUALITY, speed=SPEED)
    print(f"{jpg.name}: {image.width}x{image.height}")
