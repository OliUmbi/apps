import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { NewsletterSignup } from "../components/newsletter-signup";
import { UpdatesEmptyState } from "../components/updates-empty-state";
import { UpdatesIntroduction } from "../components/updates-introduction";
import { UpdatesList } from "../components/updates-list";
import { getUpdatePage } from "../data/updates";

export const Route = createFileRoute("/latest/")({
	loader: () => getUpdatePage({ data: { page: 0 } }),
	component: UpdatesPage,
});
function UpdatesPage() {
	const initialPage = Route.useLoaderData();
	return (
		<>
			<UpdatesIntroduction />
			<PaginatedList
				queryKey={["updates"]}
				initialPage={initialPage}
				load={(page) => getUpdatePage({ data: { page } })}
				emptyState={
					<section className="shell pb-24">
						<UpdatesEmptyState />
					</section>
				}
			>
				{(updates) => <UpdatesList updates={updates} />}
			</PaginatedList>
			<NewsletterSignup />
		</>
	);
}
