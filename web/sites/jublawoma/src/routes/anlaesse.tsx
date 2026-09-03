import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, MapPin } from "lucide-react";
import { ContentImage } from "../components/content-image";
import { dateLabel } from "../content";
import { getEvents } from "../content/content.functions";

export const Route = createFileRoute("/anlaesse")({
	loader: () => getEvents(),
	component: Events,
});
function Events() {
	const events = Route.useLoaderData();
	return (
		<>
			<section className="page-hero shell">
				<div>
					<p className="kicker">Gemeinsam unterwegs</p>
					<h1>
						Anlässe
						<br />
						<span>2026/27</span>
					</h1>
					<p>
						Gruppenstunden, Scharanlässe und Lager: Hier finden Familien die
						nächsten gemeinsamen Termine.
					</p>
					<a
						className="button dark"
						href="/assets/documents/Jahreskalender-Jubla-Woma.pdf"
						target="_blank"
						rel="noopener"
					>
						<Download size={17} /> Jahreskalender als PDF
					</a>
				</div>
				<img src="/assets/images/doodles/rolling.svg" alt="" />
			</section>
			<section className="shell event-list">
				{events.map((event, index) => (
					<Link
						to="/anlaesse/$slug"
						params={{ slug: event.slug }}
						key={event.id}
					>
						<article>
							<div className="event-number">
								{String(index + 1).padStart(2, "0")}
							</div>
							<ContentImage
								src={event.media[0]?.storageKey}
								alt={event.media[0]?.altText || event.title}
								seed={event.id}
							/>
							<div>
								<p className="kicker">
									{dateLabel(event.startsOn, event.endsOn)}
								</p>
								<h2>{event.title}</h2>
								<p>
									<MapPin size={16} /> {event.location}
								</p>
							</div>
							<CalendarDays className="event-icon" />
						</article>
					</Link>
				))}
			</section>
		</>
	);
}
