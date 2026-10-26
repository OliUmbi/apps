import type { ContentImage } from "../model/content";
import { MediaImage } from "./media-image";

export function StoryGallery({ images }: { images: ContentImage[] }) {
	if (!images.length) return null;
	return (
		<section className="shell media-gallery">
			{images.map((image) => (
				<MediaImage
					key={image.id}
					src={image.src}
					alt={image.alt}
					seed={image.id}
					sizes="(min-width: 850px) 50vw, 100vw"
				/>
			))}
		</section>
	);
}
