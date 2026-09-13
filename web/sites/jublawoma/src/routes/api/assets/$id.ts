import { proxyPublicImage } from "@oliumbi/assets/public-image.server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assets/$id")({
	server: {
		handlers: {
			GET: ({ params, request }) => proxyPublicImage(request, params.id),
		},
	},
});
