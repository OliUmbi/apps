import type { ContentImage } from "../model/content";
import { MediaImage } from "./media-image";

export function StoryGallery({ images }: { images: ContentImage[] }) {
	if (!images.length) return null;
	return (
		<div className="grid content-start gap-5">
			{images.map((image) => (
				<MediaImage
					key={image.id}
					src={image.src}
					alt={image.alt}
					seed={image.id}
					className="aspect-[4/3] w-full object-cover"
					sizes="(min-width: 1024px) 58vw, 100vw"
				/>
			))}
		</div>
	);
}
