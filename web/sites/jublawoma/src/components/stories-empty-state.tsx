import { m } from "@oliumbi/i18n/messages";

export function StoriesEmptyState() {
	return (
		<section className="mx-auto w-[min(100%_-_2rem,1240px)] honest-empty">
			<p className="kicker">{m.jublawoma_stories_empty_eyebrow()}</p>
			<h2>{m.jublawoma_stories_empty_title()}</h2>
			<p>{m.jublawoma_stories_empty_body()}</p>
		</section>
	);
}
