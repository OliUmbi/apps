import { m } from "@oliumbi/i18n/messages";
import type { EventRecord } from "@oliumbi/jublawoma-data/content.types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { ContentImage } from "../../components/content-image";
import { dateLabel } from "../../content";
import { getEvent } from "../../content/content.functions";

export const Route = createFileRoute("/events/$eventId")({
	loader: async ({ params }) => {
		const event = (await getEvent({
			data: { id: params.eventId },
		})) as EventRecord | null;
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
					<p className="kicker">{m.jublawoma_routes_events_slug_paragraph()}</p>
					<h1>{event.title}</h1>
					<div className="detail-meta">
						<span>
							<CalendarDays />
							{dateLabel(event.startsOn, event.endsOn)}
						</span>
						<span>
							<MapPin />
							{event.location || m.jublawoma_routes_events_slug_feedback()}
						</span>
					</div>
					{event.summary ? <p>{event.summary}</p> : null}
				</div>
				<ContentImage
					src={cover?.storageKey}
					alt={cover?.altText || event.title}
					seed={event.id}
				/>
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
