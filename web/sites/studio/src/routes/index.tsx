import { siteIds } from "@oliumbi/contracts";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Dashboard } from "../components/dashboard";
import { Login } from "../components/login";
import { getSession } from "../server/resources.functions";
export const Route = createFileRoute("/")({
	validateSearch: z.object({
		site: z.enum(siteIds).catch("zelglihof"),
		section: z.string().catch("overview"),
	}),
	loader: () => getSession(),
	component: Studio,
});
function Studio() {
	const actor = Route.useLoaderData();
	return actor ? <Dashboard actor={actor} /> : <Login />;
}
