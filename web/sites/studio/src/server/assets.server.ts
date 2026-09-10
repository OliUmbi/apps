import { createAssetsClient } from "@oliumbi/assets";
import type { ResourceRecord, SiteId } from "@oliumbi/contracts";

export const assets = createAssetsClient({
	baseUrl: () => process.env.ASSETS_SERVICE_URL ?? "http://localhost:8083",
	token: () => process.env.ASSETS_INTERNAL_AUTHORIZATION_TOKEN,
});

export async function validateImages(site: SiteId, values: ResourceRecord) {
	if (typeof values.image_id === "string") {
		await assets.images.get(site, values.image_id);
	}
}
