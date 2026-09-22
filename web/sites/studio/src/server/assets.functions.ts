import {
	idSchema,
	pageSchema,
	siteSchema,
	slugSchema,
} from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "./assets.server";
import { requireActor } from "./auth.server";

const assetInput = z.object({
	site: siteSchema,
	kind: z.enum(["images", "documents"]),
});
const listAssetInput = assetInput.extend(pageSchema.shape);
const visibilityInput = assetInput.extend({
	id: idSchema,
	visible: z.boolean(),
});
const deleteAssetInput = assetInput.extend({ id: idSchema });
export const listAssets = createServerFn({ method: "GET" })
	.validator(listAssetInput)
	.handler(async ({ data }) => {
		await requireActor(data.site);
		return assets[data.kind].list(data.site, data.page, data.size);
	});
export const setAssetVisibility = createServerFn({ method: "POST" })
	.validator(visibilityInput)
	.handler(async ({ data }) => {
		await requireActor(data.site);
		await assets[data.kind].visibility(data.site, data.id, data.visible);
	});
export const deleteAsset = createServerFn({ method: "POST" })
	.validator(deleteAssetInput)
	.handler(async ({ data }) => {
		await requireActor(data.site);
		await assets[data.kind].delete(data.site, data.id);
	});
export const uploadAsset = createServerFn({ method: "POST" })
	.validator((input: FormData) => input)
	.handler(async ({ data }) => {
		const input = assetInput.parse(Object.fromEntries(data));
		await requireActor(input.site);
		const file = data.get("file");
		if (!(file instanceof File)) throw new Error("File required");
		const slug =
			input.kind === "documents"
				? slugSchema.parse(data.get("slug"))
				: undefined;
		return assets[input.kind].upload(input.site, file, {
			visible: data.get("visible") === "true",
			slug,
		});
	});
