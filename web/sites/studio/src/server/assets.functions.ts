import {
	idSchema,
	pageSchema,
	siteSchema,
	slugSchema,
} from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets as client } from "./assets.server";
import { requireActor } from "./auth.server";

const assetInput = z.object({
	site: siteSchema,
	kind: z.enum(["images", "documents"]),
});
export const listAssets = createServerFn({ method: "GET" })
	.validator(assetInput.extend(pageSchema.shape))
	.handler(async ({ data }) => {
		await requireActor(data.site);
		return client[data.kind].list(data.site, data.page, data.size);
	});
export const setAssetVisibility = createServerFn({ method: "POST" })
	.validator(assetInput.extend({ id: idSchema, visible: z.boolean() }))
	.handler(async ({ data }) => {
		await requireActor(data.site);
		await client[data.kind].visibility(data.site, data.id, data.visible);
	});
export const deleteAsset = createServerFn({ method: "POST" })
	.validator(assetInput.extend({ id: idSchema }))
	.handler(async ({ data }) => {
		await requireActor(data.site);
		await client[data.kind].delete(data.site, data.id);
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
		await client[input.kind].upload(input.site, file, {
			visible: data.get("visible") === "true",
			slug,
		});
	});
