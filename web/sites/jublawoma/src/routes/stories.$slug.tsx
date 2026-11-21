import { slugSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarkdownContent } from "../components/markdown-content";
import { StoryGallery } from "../components/story-gallery";
import { StoryIntroduction } from "../components/story-introduction";
import { getStory } from "../data/stories";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/stories/$slug")({
	loader: async ({ params }) => {
		// A malformed slug must render the branded 404: the server function's
		// validator would reject it before any lookup could return not-found (X-07).
		const slug = slugSchema.safeParse(params.slug);
		if (!slug.success) throw notFound();
		const story = await getStory({
			data: { slug: slug.data },
		});
		if (!story) throw notFound();
		return story;
	},
	head: ({ loaderData }) =>
		loaderData
			? pageHead({
					title: loaderData.title,
					description: loaderData.description,
					image: loaderData.image?.src,
				})
			: pageHead({ title: m.jublawoma_navigation_stories() }),
	component: StoryDetail,
});

function StoryDetail() {
	const story = Route.useLoaderData();
	const hasGallery = story.gallery.length > 0;
	return (
		<article>
			<StoryIntroduction story={story} />
			<div
				className={`shell grid gap-10 py-16 md:py-20 ${
					hasGallery ? "lg:grid-cols-[0.72fr_1.28fr] lg:gap-16" : ""
				}`}
			>
				<section className={hasGallery ? "max-w-[36rem]" : "max-w-[46rem]"}>
					<MarkdownContent value={story.body} />
				</section>
				{hasGallery ? <StoryGallery images={story.gallery} /> : null}
			</div>
		</article>
	);
}
