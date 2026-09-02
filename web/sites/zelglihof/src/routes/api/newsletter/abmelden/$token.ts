import { createFileRoute } from "@tanstack/react-router";
import { unsubscribeNewsletter } from "../../../../newsletter/newsletter.server";

export const Route = createFileRoute("/api/newsletter/abmelden/$token")({
	server: {
		handlers: {
			POST: async ({ params, request }) => {
				const body = await request.text();
				if (!body.includes("List-Unsubscribe=One-Click")) {
					return new Response("Invalid one-click unsubscribe request", {
						status: 400,
					});
				}
				const result = await unsubscribeNewsletter(params.token);
				return result.outcome === "invalid"
					? new Response("Not found", { status: 404 })
					: new Response(null, { status: 204 });
			},
		},
	},
});
