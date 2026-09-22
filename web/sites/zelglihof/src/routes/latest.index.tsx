import type { Page as PageData } from "@oliumbi/contracts";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import type { Update } from "@oliumbi/zelglihof-data/public.types";
import { createFileRoute } from "@tanstack/react-router";
import { UpdatesList } from "../components/updates-list";
import { getUpdatePage } from "../data/updates";

export const Route = createFileRoute("/latest/")({
	loader: () =>
		getUpdatePage({ data: { page: 0 } }) as Promise<PageData<Update>>,
	component: Page,
});
function Page() {
	return (
		<PaginatedList<Update>
			queryKey={["updates"]}
			initialPage={Route.useLoaderData()}
			load={(page) =>
				getUpdatePage({ data: { page } }) as Promise<PageData<Update>>
			}
		>
			{(items) => <UpdatesList updates={items} />}
		</PaginatedList>
	);
}
