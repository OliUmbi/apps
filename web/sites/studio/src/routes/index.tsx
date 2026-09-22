import { siteIds } from "@oliumbi/contracts";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DashboardView } from "../components/dashboard-view";
import { LoginView } from "../components/login-view";
import { getSession } from "../server/session.functions";

export const Route = createFileRoute("/")({
	validateSearch: z.object({
		site: z.enum(siteIds).catch("zelglihof"),
		area: z.enum(["site", "administration", "profile"]).catch("site"),
		section: z.string().catch("overview"),
		mode: z.enum(["list", "create", "detail"]).catch("list"),
		record: z.uuid().optional(),
	}),
	loader: () => getSession(),
	component: Studio,
});
function Studio() {
	const actor = Route.useLoaderData();
	return actor ? <DashboardView actor={actor} /> : <LoginView />;
}
