import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { dateLabel } from "../../data/dates";
import type { EventRecord } from "../../model/content";

export function NextEvent({ event }: { event: EventRecord }) {
	return (
		<section className="border-b border-bark/15 bg-sage/40">
			<div className="shell grid min-h-28 items-center gap-5 py-6 md:grid-cols-[10rem_1fr_auto]">
				<p className="kicker">{m.jublawoma_home_next_event_eyebrow()}</p>
				<div className="flex flex-wrap items-center gap-x-8 gap-y-2">
					<strong className="text-2xl">{event.title}</strong>
					<span className="inline-flex items-center gap-2 text-sm text-bark/65">
						<CalendarDays size={15} />
						{dateLabel(event.startsOn, event.endsOn)}
					</span>
					<span className="inline-flex items-center gap-2 text-sm text-bark/65">
						<MapPin size={15} />
						{event.location}
					</span>
				</div>
				<Link
					to="/events"
					className="round-link"
					aria-label={m.jublawoma_home_next_event_action_label()}
				>
					<ArrowRight />
				</Link>
			</div>
		</section>
	);
}
