import { createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { ContentImage } from "../../components/content-image";
import { MarkdownContent } from "../../components/markdown-content";
import { dateLabel } from "../../content";
import { getEvent } from "../../content/content.functions";

export const Route = createFileRoute("/anlaesse/$slug")({
	loader: async ({ params }) => {
		const event = await getEvent({ data: { slug: params.slug } });
		if (!event) throw notFound();
		return event;
	},
	component: EventDetail,
});

function EventDetail() {
	const event = Route.useLoaderData();
	const cover =
		event.media.find((item) => item.role === "cover") ?? event.media[0];
	const gallery = event.media.filter((item) => item.id !== cover?.id);
	return (
		<>
			<section className="shell detail-hero">
				<div>
					<p className="kicker">Anlass</p>
					<h1>{event.title}</h1>
					<div className="detail-meta">
						<span>
							<CalendarDays />
							{dateLabel(event.startsOn, event.endsOn)}
						</span>
						<span>
							<MapPin />
							{event.location || "Ort folgt"}
						</span>
					</div>
					{event.summary ? <p>{event.summary}</p> : null}
					{event.registrationUrl ? (
						<a
							className="button dark"
							href={event.registrationUrl}
							target="_blank"
							rel="noreferrer"
						>
							Anmeldung öffnen <ExternalLink size={16} />
						</a>
					) : null}
				</div>
				<ContentImage
					src={cover?.storageKey}
					alt={cover?.altText || event.title}
					seed={event.id}
				/>
			</section>
			<section className="shell detail-body">
				<MarkdownContent value={event.bodyMarkdown} />
			</section>
			{gallery.length ? (
				<section className="shell media-gallery">
					{gallery.map((image) => (
						<ContentImage
							key={image.id}
							src={image.storageKey}
							alt={image.altText}
							seed={image.id}
						/>
					))}
				</section>
			) : null}
		</>
	);
}
