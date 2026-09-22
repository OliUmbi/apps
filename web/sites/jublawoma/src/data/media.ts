import { publicImageUrl } from "@oliumbi/assets/urls";
import type { MediaAsset } from "../model/content";

export function mediaFromImages(
	coverId: string | null,
	coverAlt: string,
	images: readonly { imageId: string; description: string }[] = [],
): MediaAsset[] {
	return [
		...(coverId
			? [
					{
						id: coverId,
						src: publicImageUrl(coverId),
						alt: coverAlt,
						role: "cover" as const,
						position: 0,
					},
				]
			: []),
		...images.map((image, index) => ({
			id: image.imageId,
			src: publicImageUrl(image.imageId),
			alt: image.description,
			role: "gallery" as const,
			position: index + 1,
		})),
	];
}
