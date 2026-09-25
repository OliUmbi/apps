import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import type { StorySummary } from "../model/content";
import { formatDate } from "../model/dates";
import { MediaImage } from "./media-image";

export function StoriesList({ stories }: { stories: StorySummary[] }) {
	if (stories.length === 0) return null;
	return (
		<section className="shell story-grid">
			{stories.map((story) => (
				<Link to="/stories/$slug" params={{ slug: story.slug }} key={story.id}>
					<article>
						<MediaImage
							src={story.image?.src}
							alt={story.image?.alt || story.title}
							seed={story.id}
							sizes="(min-width: 850px) 45vw, 100vw"
						/>
						<p className="kicker">
							{story.publishedOn ? formatDate(story.publishedOn) : m.story()}
						</p>
						<h2>{story.title}</h2>
						<p>{story.description}</p>
					</article>
				</Link>
			))}
		</section>
	);
}
