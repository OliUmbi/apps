import type { Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import type { StoryRecord } from "@oliumbi/jublawoma-data/content.types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { ContentImage } from "../../components/content-image";
import { PaginatedList } from "../../components/ui/paginated-list";
import { getStoryPage } from "../../content/content.functions";
export const Route = createFileRoute("/stories/")({
	loader: () =>
		getStoryPage({ data: { page: 0 } }) as Promise<Page<StoryRecord>>,
	component: Stories,
});
function Stories() {
	const initialPage = Route.useLoaderData();
	return (
		<PaginatedList<StoryRecord>
			queryKey={["stories"]}
			initialPage={initialPage}
			load={(page) =>
				getStoryPage({ data: { page } }) as Promise<Page<StoryRecord>>
			}
		>
			{(stories) => (
				<>
					<section className="shell stories-page compact">
						<div>
							<p className="kicker">{m.jublawoma_routes_stories_paragraph()}</p>
							<h1>
								{m.jublawoma_routes_stories_heading()}
								<br />
								{m.jublawoma_routes_stories_heading_2()}
							</h1>
							<p>{m.jublawoma_routes_stories_paragraph_2()}</p>
							<a
								className="button dark"
								href="https://www.instagram.com/jubla_woma/"
								target="_blank"
								rel="noreferrer"
							>
								<Camera size={17} />
								{m.jublawoma_routes_stories_text()}
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
									to="/stories/$slug"
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
							<p className="kicker">
								{m.jublawoma_routes_stories_paragraph_3()}
							</p>
							<h2>{m.jublawoma_routes_stories_heading_3()}</h2>
							<p>{m.jublawoma_routes_stories_paragraph_4()}</p>
						</section>
					)}
				</>
			)}
		</PaginatedList>
	);
}
