import { QueryProvider } from "@oliumbi/query";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "../components/dashboard-view";
import { LoginView } from "../components/login-view";
import {
	StudioSearchContext,
	type StudioSearchState,
} from "../hooks/use-studio-search";
import { type StudioSearch, studioSearchSchema } from "../model/navigation";
import { getSession } from "../server/session.functions";

export const Route = createFileRoute("/")({
	validateSearch: studioSearchSchema,
	loader: () => getSession(),
	component: Studio,
});
function Studio() {
	const actor = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const state: StudioSearchState = {
		search,
		navigate: (next: StudioSearch) => void navigate({ search: next }),
	};
	return (
		<QueryProvider key={actor?.id ?? "guest"}>
			{actor ? (
				<StudioSearchContext.Provider value={state}>
					<DashboardView actor={actor} />
				</StudioSearchContext.Provider>
			) : (
				<LoginView />
			)}
		</QueryProvider>
	);
}
