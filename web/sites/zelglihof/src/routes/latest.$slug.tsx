import { createFileRoute, notFound } from "@tanstack/react-router";
import { UpdateArticle } from "../components/update-article";
import { getUpdate } from "../data/updates";

export const Route = createFileRoute("/latest/$slug")({
	loader: async ({ params }) => {
		const record = await getUpdate({ data: { slug: params.slug } });
		if (!record) throw notFound();
		return record;
	},
	component: Page,
});
function Page() {
	return <UpdateArticle update={Route.useLoaderData()} />;
}
