import { createFileRoute } from "@tanstack/react-router";
import { PaginatedList } from "../../components/ui/paginated-list";
import { getArticlePage } from "../../content/catalog.functions";
import { UpdatesPage } from "../../pages/updates-page";
export const Route = createFileRoute("/latest/")({
	loader: () => getArticlePage({ data: { page: 0 } }),
	component: Page,
});
function Page() {
	return (
		<PaginatedList
			queryKey={["updates"]}
			initialPage={Route.useLoaderData()}
			load={(page) => getArticlePage({ data: { page } })}
		>
			{(items) => <UpdatesPage updates={items} />}
		</PaginatedList>
	);
}
