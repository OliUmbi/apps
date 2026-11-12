import { createAnalytics, routeIds } from "@oliumbi/analytics/server";
import { createFileRoute } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { database } from "../server/database.server";

const analytics = createAnalytics(database, "jublawoma", routeIds(routeTree));

export const Route = createFileRoute("/api/analytics/view")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = (await request.json().catch(() => null)) as {
					route?: unknown;
				} | null;
				if (typeof body?.route !== "string" || body.route.length > 120)
					return new Response(null, { status: 400 });
				await analytics.recordBestEffort(body.route);
				return new Response(null, { status: 204 });
			},
		},
	},
});
