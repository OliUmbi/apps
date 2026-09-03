import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { ContentImage } from "../components/content-image";
import { getStories } from "../content/content.functions";
export const Route = createFileRoute("/geschichten")({
	loader: () => getStories(),
	component: Stories,
});
function Stories() {
	const stories = Route.useLoaderData();
	return (
		<>
			<section className="shell stories-page compact">
				<div>
					<p className="kicker">Geschichten</p>
					<h1>
						Erlebt wird
						<br />
						draussen.
					</h1>
					<p>
						Berichte, kleine Momente und grosse Lagergeschichten – mit Bildern,
						die als eigene Galerie gepflegt werden.
					</p>
					<a
						className="button dark"
						href="https://www.instagram.com/jubla_woma/"
						target="_blank"
						rel="noreferrer"
					>
						<Camera size={17} /> Aktuelles auf Instagram
					</a>
				</div>
				<div className="story-art">
					<img src="/assets/images/doodles/selfie.svg" alt="" />
				</div>
			</section>
			{stories.length ? (
				<section className="shell story-grid">
					{stories.map((story) => (
						<Link
							to="/geschichten/$slug"
							params={{ slug: story.slug }}
							key={story.id}
						>
							<article>
								<ContentImage
									src={story.media[0]?.storageKey}
									alt={story.media[0]?.altText || story.title}
									seed={story.id}
								/>
								<p className="kicker">
									{story.publishedOn
										? new Date(
												`${story.publishedOn}T12:00:00`,
											).toLocaleDateString("de-CH")
										: "Geschichte"}
								</p>
								<h2>{story.title}</h2>
								<p>{story.summary}</p>
							</article>
						</Link>
					))}
				</section>
			) : (
				<section className="shell honest-empty">
					<p className="kicker">Noch leer</p>
					<h2>Die erste Geschichte folgt.</h2>
					<p>
						Veröffentlicht wird erst, wenn Text und Bilder bereit und
						freigegeben sind.
					</p>
				</section>
			)}
		</>
	);
}
