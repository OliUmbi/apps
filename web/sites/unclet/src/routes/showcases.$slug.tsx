import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ShowcaseDescription } from "../components/showcase-description";
import { ShowcaseGallery } from "../components/showcase-gallery";
import { getShowcase } from "../data/showcases";

export const Route = createFileRoute("/showcases/$slug")({
	loader: async ({ params }) => {
		const result = await getShowcase({
			data: { slug: params.slug },
		});
		if (!result) throw notFound();
		return result;
	},
	component: ShowcasePage,
});
function ShowcasePage() {
	const showcase = Route.useLoaderData();
	return (
		<article className="showcase-detail shell pb-24 pt-32 md:pb-32 md:pt-36">
			<Link
				to="/showcases"
				className="mb-12 inline-flex min-h-11 items-center gap-3 border border-brass/45 px-5 text-sm font-semibold text-brass-light transition hover:bg-brass hover:text-night"
			>
				<ArrowLeft size={17} aria-hidden="true" />
				{m.unclet_showcase_back()}
			</Link>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)] lg:gap-14 xl:gap-20">
				<ShowcaseGallery
					cover={showcase.image}
					images={showcase.gallery}
					title={showcase.title}
				/>
				<ShowcaseDescription showcase={showcase} />
			</div>
		</article>
	);
}
