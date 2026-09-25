import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { StoriesEmptyState } from "../components/stories-empty-state";
import { StoriesIntroduction } from "../components/stories-introduction";
import { StoriesList } from "../components/stories-list";
import { getStoryPage } from "../data/stories";

export const Route = createFileRoute("/stories/")({
	loader: () => getStoryPage({ data: { page: 0 } }),
	component: StoriesPage,
});
function StoriesPage() {
	const initialPage = Route.useLoaderData();
	return (
		<>
			<StoriesIntroduction />
			<PaginatedList
				queryKey={["stories"]}
				initialPage={initialPage}
				load={(page) => getStoryPage({ data: { page } })}
				emptyState={<StoriesEmptyState />}
			>
				{(stories) => <StoriesList stories={stories} />}
			</PaginatedList>
		</>
	);
}
