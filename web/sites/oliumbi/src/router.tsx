import { createRouter } from "@tanstack/react-router";
import { PageError } from "./components/page-error";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultErrorComponent: PageError,
	});
}
