import { idSchema, siteSchema } from "@oliumbi/contracts";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { assets } from "../../../server/assets.server";
import { requireActor } from "../../../server/auth.server";

export const Route = createFileRoute("/api/assets/$id")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
				const search = new URL(request.url).searchParams;
				const site = siteSchema.parse(search.get("site"));
				const kind = z
					.enum(["images", "documents"])
					.parse(search.get("kind") ?? "images");
				await requireActor(site);
				const response = await assets[kind].content(
					site,
					idSchema.parse(params.id),
					"sm",
				);
				return new Response(response.body, {
					headers: {
						"Content-Type":
							response.headers.get("Content-Type") ??
							"application/octet-stream",
						"Content-Disposition":
							response.headers.get("Content-Disposition") ?? "inline",
						"Cache-Control": "private, no-store",
						"X-Content-Type-Options": "nosniff",
					},
				});
			},
		},
	},
});
