import { m } from "@oliumbi/i18n/messages";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { StoriesEmptyState } from "../components/stories-empty-state";
import { StoriesIntroduction } from "../components/stories-introduction";
import { StoriesList } from "../components/stories-list";
import { getStoryPage } from "../data/stories";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/stories/")({
	loader: () => getStoryPage({ data: { page: 0 } }),
	head: () =>
		pageHead({
			title: m.jublawoma_navigation_stories(),
			description: m.jublawoma_stories_description(),
		}),
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
				containerClassName="shell"
				emptyState={<StoriesEmptyState />}
			>
				{(stories) => <StoriesList stories={stories} />}
			</PaginatedList>
		</>
	);
}
