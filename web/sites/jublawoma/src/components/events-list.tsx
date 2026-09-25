import { CalendarDays, MapPin } from "lucide-react";
import type { PublicEvent } from "../model/content";
import { formatEventDates } from "../model/dates";
import { MediaImage } from "./media-image";

export function EventsList({ events }: { events: PublicEvent[] }) {
	if (events.length === 0) return null;
	return (
		<section className="shell event-list">
			{events.map((event, index) => (
				<article key={event.id}>
					<div className="event-number">
						{String(index + 1).padStart(2, "0")}
					</div>
					<MediaImage
						className="event-image"
						src={event.image?.src}
						alt={event.image?.alt || event.title}
						seed={event.id}
						sizes="(min-width: 851px) 260px, (min-width: 521px) 110px, 100vw"
					/>
					<div>
						<p className="kicker">
							{formatEventDates(event.startsOn, event.endsOn)}
						</p>
						<h2>{event.title}</h2>
						<p>
							<MapPin size={16} /> {event.location}
						</p>
					</div>
					<CalendarDays className="event-icon" />
				</article>
			))}
		</section>
	);
}
