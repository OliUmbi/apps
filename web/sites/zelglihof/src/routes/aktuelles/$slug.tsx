import { createFileRoute } from "@tanstack/react-router";
import { findUpdate } from "../../content/site-content";
import { UpdatePage } from "../../pages/update-page";
export const Route = createFileRoute("/aktuelles/$slug")({
	head: ({ params }) => {
		const update = findUpdate(params.slug);
		return {
			meta: [
				{ title: `${update?.title ?? "Aktuelles"} · Zelglihof` },
				...(update
					? [{ name: "description", content: update.description }]
					: []),
			],
		};
	},
	component: RouteComponent,
});
function RouteComponent() {
	const { slug } = Route.useParams();
	return <UpdatePage slug={slug} />;
}
