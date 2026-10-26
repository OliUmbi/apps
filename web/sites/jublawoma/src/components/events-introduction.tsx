import { m } from "@oliumbi/i18n/messages";
import { Download } from "lucide-react";
import { calendarPdf } from "../model/links";

export function EventsIntroduction() {
	return (
		<section className="page-hero shell">
			<div>
				<p className="kicker">{m.jublawoma_events_eyebrow()}</p>
				<h1>
					{m.jublawoma_events_title()}
					<br />
					<span>{m.jublawoma_events_title_accent()}</span>
				</h1>
				<p>{m.jublawoma_events_description()}</p>
				<a
					className="button dark"
					href={calendarPdf}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Download size={17} aria-hidden="true" />
					{m.jublawoma_events_download_calendar()}
				</a>
			</div>
			<img src="/assets/images/doodles/rolling.svg" alt="" />
		</section>
	);
}
