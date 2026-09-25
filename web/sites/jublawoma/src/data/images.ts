import { publicImageUrl } from "@oliumbi/assets/urls";
import type { ContentImage } from "../model/content";

export function imageFromId(id: string, alt: string): ContentImage {
	return { id, src: publicImageUrl(id), alt };
}
