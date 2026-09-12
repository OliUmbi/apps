import type { Page as PageData } from "@oliumbi/contracts";
import type { Update } from "@oliumbi/zelglihof-data/content.types";
import { createFileRoute } from "@tanstack/react-router";
import { PaginatedList } from "../../components/ui/paginated-list";
import { getArticlePage } from "../../content/catalog.functions";
import { UpdatesPage } from "../../pages/updates-page";
export const Route = createFileRoute("/latest/")({
	loader: () =>
		getArticlePage({ data: { page: 0 } }) as Promise<PageData<Update>>,
	component: Page,
});
function Page() {
	return (
		<PaginatedList<Update>
			queryKey={["updates"]}
			initialPage={Route.useLoaderData()}
			load={(page) =>
				getArticlePage({ data: { page } }) as Promise<PageData<Update>>
			}
		>
			{(items) => <UpdatesPage updates={items} />}
		</PaginatedList>
	);
}
