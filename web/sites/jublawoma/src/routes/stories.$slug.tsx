import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarkdownContent } from "../components/markdown-content";
import { StoryGallery } from "../components/story-gallery";
import { StoryIntroduction } from "../components/story-introduction";
import { getStory } from "../data/stories";

export const Route = createFileRoute("/stories/$slug")({
	loader: async ({ params }) => {
		const story = await getStory({
			data: { slug: params.slug },
		});
		if (!story) throw notFound();
		return story;
	},
	component: StoryDetail,
});

function StoryDetail() {
	const story = Route.useLoaderData();
	return (
		<article>
			<StoryIntroduction story={story} />
			<section className="shell detail-body">
				<MarkdownContent value={story.body} />
			</section>
			<StoryGallery images={story.gallery} />
		</article>
	);
}
