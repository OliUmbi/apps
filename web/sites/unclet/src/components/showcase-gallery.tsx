import type { ContentImage } from "../model/content";
import { AssetImage } from "./asset-image";

export function ShowcaseGallery({
	cover,
	images,
	title,
}: {
	cover: ContentImage | null;
	images: ContentImage[];
	title: string;
}) {
	return (
		<div className="showcase-gallery">
			<AssetImage
				src={cover?.src}
				alt={cover?.alt ?? title}
				loading="eager"
				sizes="(min-width: 1024px) 64vw, 100vw"
				className="showcase-cover w-full object-cover"
			/>
			{images.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2">
					{images.map((image) => (
						<figure key={image.id}>
							<AssetImage
								src={image.src}
								alt={image.alt}
								sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
								className="aspect-[4/3] w-full object-cover"
							/>
							{image.alt && (
								<figcaption className="mt-3 text-sm text-bone/60">
									{image.alt}
								</figcaption>
							)}
						</figure>
					))}
				</div>
			)}
		</div>
	);
}
