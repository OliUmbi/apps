import { QueryProvider } from "@oliumbi/query";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "../components/dashboard-view";
import { LoginView } from "../components/login-view";
import { studioSearchSchema } from "../model/navigation";
import { getSession } from "../server/session.functions";

export const Route = createFileRoute("/")({
	validateSearch: studioSearchSchema,
	loader: () => getSession(),
	component: Studio,
});
function Studio() {
	const actor = Route.useLoaderData();
	return (
		<QueryProvider key={actor?.id ?? "guest"}>
			{actor ? <DashboardView actor={actor} /> : <LoginView />}
		</QueryProvider>
	);
}
