import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { UpdatesList } from "../components/updates-list";
import { getUpdatePage } from "../data/updates";
import type { Update } from "../model/content";

export const Route = createFileRoute("/latest/")({
	loader: () => getUpdatePage({ data: { page: 0 } }),
	component: Page,
});
function Page() {
	return (
		<PaginatedList<Update>
			queryKey={["updates"]}
			initialPage={Route.useLoaderData()}
			load={(page) => getUpdatePage({ data: { page } })}
		>
			{(items) => <UpdatesList updates={items} />}
		</PaginatedList>
	);
}
