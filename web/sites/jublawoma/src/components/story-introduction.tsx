import { m } from "@oliumbi/i18n/messages";
import type { PublicStory } from "../model/content";
import { formatDate } from "../model/dates";
import { MediaImage } from "./media-image";

export function StoryIntroduction({ story }: { story: PublicStory }) {
	return (
		<>
			<header className="mx-auto w-[min(100%_-_2rem,1240px)] story-detail-header">
				<p className="kicker">
					{story.publishedOn ? formatDate(story.publishedOn) : m.story()}
				</p>
				<p className="mt-3 text-moss font-extrabold">{story.author}</p>
				<h1>{story.title}</h1>
				{story.description ? <p>{story.description}</p> : null}
			</header>
			<div className="mx-auto w-[min(100%_-_2rem,1240px)] story-cover">
				<MediaImage
					src={story.image?.src}
					alt={story.image?.alt || story.title}
					seed={story.id}
					loading="eager"
				/>
			</div>
		</>
	);
}
