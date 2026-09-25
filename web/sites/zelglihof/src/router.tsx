import { deLocalizeUrl, localizeUrl } from "@oliumbi/i18n/runtime";
import { createRouter } from "@tanstack/react-router";
import { PageError } from "./components/page-error";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		defaultErrorComponent: PageError,
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
		scrollRestoration: true,
	});

	return router;
}
