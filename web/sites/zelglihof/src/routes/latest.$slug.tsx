import { slugSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { UpdateArticle } from "../components/update-article";
import { getUpdate } from "../data/updates";
import { absoluteUrl } from "../model/links";

export const Route = createFileRoute("/latest/$slug")({
	loader: async ({ params }) => {
		// A malformed slug is a missing page (branded 404), never an error page:
		// it is rejected here before the server function's validator runs.
		const slug = slugSchema.safeParse(params.slug);
		if (!slug.success) throw notFound();
		const record = await getUpdate({ data: { slug: slug.data } });
		if (!record) throw notFound();
		return record;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [] };
		return {
			meta: [
				{ title: `${loaderData.title} · ${m.zelglihof_page_title_suffix()}` },
				{ name: "description", content: loaderData.description },
				{ property: "og:title", content: loaderData.title },
				{ property: "og:description", content: loaderData.description },
				...(loaderData.image
					? [{ property: "og:image", content: absoluteUrl(loaderData.image) }]
					: []),
			],
		};
	},
	component: Page,
});
function Page() {
	return <UpdateArticle update={Route.useLoaderData()} />;
}
