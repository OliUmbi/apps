import { createFileRoute, notFound } from "@tanstack/react-router";
import { getArticle } from "../../content/catalog.functions";
import { UpdatePage } from "../../pages/update-page";
export const Route = createFileRoute("/latest/$slug")({
	loader: async ({ params }) => {
		const record = await getArticle({ data: { slug: params.slug } });
		if (!record) throw notFound();
		return record;
	},
	component: Page,
});
function Page() {
	return <UpdatePage update={Route.useLoaderData()} />;
}
