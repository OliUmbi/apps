import { publicImageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import type { MediaAsset } from "@oliumbi/jublawoma-data/public.types";

export function mediaFromRecord(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): MediaAsset[] {
	const cover: MediaAsset[] = record.image_id
		? [
				{
					id: String(record.image_id),
					storageKey: publicImageUrl(String(record.image_id)),
					altText: String(record.title ?? record.name),
					role: "cover",
					position: 0,
				},
			]
		: [];
	return [
		...cover,
		...children.map((image, index) => ({
			id: String(image.image_id),
			storageKey: publicImageUrl(String(image.image_id)),
			altText: String(image.description),
			role: "gallery" as const,
			position: index + 1,
		})),
	];
}
