import { m } from "@oliumbi/i18n/messages";
import { Download } from "lucide-react";

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
					href="/assets/documents/Jahreskalender-Jubla-Woma.pdf"
					target="_blank"
					rel="noopener"
				>
					<Download size={17} />
					{m.jublawoma_events_download_calendar()}
				</a>
			</div>
			<img src="/assets/images/doodles/rolling.svg" alt="" />
		</section>
	);
}
