import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, MapPin } from "lucide-react";
import { ContentImage } from "../components/content-image";
import { PaginatedList } from "../components/ui/paginated-list";
import { dateLabel } from "../content";
import { getEventPage } from "../content/content.functions";

export const Route = createFileRoute("/events")({
	loader: () => getEventPage({ data: { page: 0 } }),
	component: Events,
});
function Events() {
	const initialPage = Route.useLoaderData();
	return (
		<PaginatedList
			queryKey={["events"]}
			initialPage={initialPage}
			load={(page) => getEventPage({ data: { page } })}
		>
			{(events) => (
				<>
					<section className="page-hero shell">
						<div>
							<p className="kicker">{m.jublawoma_routes_events_paragraph()}</p>
							<h1>
								{m.jublawoma_routes_events_heading()}
								<br />
								<span>{m.jublawoma_routes_events_text()}</span>
							</h1>
							<p>{m.jublawoma_routes_events_paragraph_2()}</p>
							<a
								className="button dark"
								href="/assets/documents/Jahreskalender-Jubla-Woma.pdf"
								target="_blank"
								rel="noopener"
							>
								<Download size={17} />
								{m.jublawoma_routes_events_text_2()}
							</a>
						</div>
						<img src="/assets/images/doodles/rolling.svg" alt="" />
					</section>
					<section className="shell event-list">
						{events.map((event, index) => (
							<Link
								to="/events/$eventId"
								params={{ eventId: event.id }}
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
			)}
		</PaginatedList>
	);
}
