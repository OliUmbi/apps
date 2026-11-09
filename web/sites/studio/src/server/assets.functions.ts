import {
	AppError,
	idSchema,
	mapErrors,
	pageSchema,
	siteSchema,
	slugSchema,
} from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assets } from "./assets.server";
import { studioAuthorization } from "./studio-authorization";

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

function assetSite(data: unknown) {
	const parsed = assetInput.safeParse(
		data instanceof FormData ? Object.fromEntries(data) : data,
	);
	if (!parsed.success)
		throw new AppError("validation", "Site and asset kind are required");
	return parsed.data.site;
}

export const listAssets = createServerFn({ method: "GET" }).middleware([studioAuthorization(assetSite)])
	.validator(listAssetInput)
	.handler(async ({ data }) => {
		return assets[data.kind].list(data.site, data.page, data.size);
	});
export const setAssetVisibility = createServerFn({ method: "POST" }).middleware([studioAuthorization(assetSite)])
	.validator(visibilityInput)
	.handler(async ({ data }) => {
		await assets[data.kind].visibility(data.site, data.id, data.visible);
	});
export const deleteAsset = createServerFn({ method: "POST" }).middleware([studioAuthorization(assetSite)])
	.validator(deleteAssetInput)
	.handler(async ({ data }) => {
		await assets[data.kind].delete(data.site, data.id);
	});
export const uploadAsset = createServerFn({ method: "POST" }).middleware([studioAuthorization(assetSite)])
	.validator((input: unknown) => input as FormData)
	.handler(async ({ data }) =>
		// One boundary: the handler-level schema reads leave typed as validation
		// verdicts, never as raw ZodErrors across the server-function boundary.
		mapErrors(async () => {
			const input = assetInput.parse(Object.fromEntries(data));
			const file = data.get("file");
			if (!(file instanceof File))
				throw new AppError("validation", "File required");
			const slug =
				input.kind === "documents"
					? slugSchema.parse(data.get("slug"))
					: undefined;
			return assets[input.kind].upload(input.site, file, {
				visible: data.get("visible") === "true",
				slug,
			});
		}),
	);
