import { documentSchema, imageDetailSchema, imageSchema } from "./schemas";

export type * from "./types";

import type { SiteId } from "@oliumbi/contracts";
import {
	createHttpClient,
	pagedSchema,
	type ServiceOptions,
} from "@oliumbi/http-client";
import type { z } from "zod";

export * from "./urls";

export function createAssetsClient(options: Omit<ServiceOptions, "name">) {
	const http = createHttpClient({ ...options, name: "Assets" });

	function resource<T, Detail>(
		kind: string,
		schema: z.ZodType<T>,
		detail: z.ZodType<Detail>,
	) {
		const url = (
			site: SiteId,
			suffix = "",
			query: Record<string, string> = {},
		) =>
			`/internal/${kind}${suffix}?${new URLSearchParams({ site, ...query })}`;
		return {
			list: (site: SiteId, page = 0, size = 30, visible?: boolean) =>
				http.json(
					url(site, "", {
						page: String(page),
						size: String(size),
						...(visible === undefined ? {} : { visible: String(visible) }),
					}),
					pagedSchema(schema),
				),
			get: (site: SiteId, id: string) =>
				http.json(url(site, `/${encodeURIComponent(id)}`), detail),
			content: (site: SiteId, id: string, size = "xl") =>
				http.request(url(site, `/${encodeURIComponent(id)}/content`, { size })),
			async upload(
				site: SiteId,
				file: File,
				metadata: { visible: boolean; slug?: string },
			) {
				const body = new FormData();
				body.set(
					"metadata",
					new Blob([JSON.stringify(metadata)], { type: "application/json" }),
				);
				body.set("file", file);
				return http.json(url(site), detail, { method: "POST", body });
			},
			visibility: (site: SiteId, id: string, visible: boolean) =>
				http.json(url(site, `/${encodeURIComponent(id)}/visibility`), schema, {
					method: "PATCH",
					body: JSON.stringify({ visible }),
				}),
			delete: (site: SiteId, id: string) =>
				http.empty(url(site, `/${encodeURIComponent(id)}`), {
					method: "DELETE",
				}),
		};
	}

	return {
		images: resource("images", imageSchema, imageDetailSchema),
		documents: resource("documents", documentSchema, documentSchema),
	};
}
