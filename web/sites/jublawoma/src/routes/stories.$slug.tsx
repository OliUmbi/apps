import type { StoryRecord } from "@oliumbi/jublawoma-data/public.types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarkdownContent } from "../components/markdown-content";
import { MediaImage } from "../components/media-image";
import { getStory } from "../data/stories";

export const Route = createFileRoute("/stories/$slug")({
	loader: async ({ params }) => {
		const story = (await getStory({
			data: { slug: params.slug },
		})) as StoryRecord | null;
		if (!story) throw notFound();
		return story;
	},
	component: StoryDetail,
});

function StoryDetail() {
	const story = Route.useLoaderData();
	const cover =
		story.media.find((item) => item.role === "cover") ?? story.media[0];
	const gallery = story.media.filter((item) => item.id !== cover?.id);
	return (
		<article>
			<header className="shell story-detail-header">
				<p className="kicker">
					{story.publishedOn
						? new Date(`${story.publishedOn}T12:00:00`).toLocaleDateString(
								"de-CH",
							)
						: "Geschichte"}
				</p>
				<p className="story-author">{story.author}</p>
				<h1>{story.title}</h1>
				{story.summary ? <p>{story.summary}</p> : null}
			</header>
			<div className="shell story-cover">
				<MediaImage
					src={cover?.storageKey}
					alt={cover?.altText || story.title}
					seed={story.id}
				/>
			</div>
			<section className="shell detail-body">
				<MarkdownContent value={story.bodyMarkdown} />
			</section>
			{gallery.length ? (
				<section className="shell media-gallery">
					{gallery.map((image) => (
						<MediaImage
							key={image.id}
							src={image.storageKey}
							alt={image.altText}
							seed={image.id}
						/>
					))}
				</section>
			) : null}
		</article>
	);
}
