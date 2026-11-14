import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { ArrowRight } from "lucide-react";
import type { StudioSectionId } from "../model/navigation";
import type { StudioSite } from "../model/sites";
import { TrafficOverview } from "./traffic-view";

export function SiteOverview({
	site,
	onSelectSection,
}: {
	site: StudioSite;
	onSelectSection: (section: StudioSectionId) => void;
}) {
	return (
		<div className="grid gap-8">
			<header className="overview-hero gradient-tide noise">
				<div className="relative z-10">
					<p className="overview-domain">{site.domain}</p>
					<h1>{m.studio_overview_title({ site: site.name })}</h1>
					<p>{m.studio_overview_description()}</p>
				</div>
				<span className="overview-site-code" aria-hidden="true">
					{site.short}
				</span>
			</header>
			<div className="overview-directory">
				{site.sections
					.filter((item) => item.id !== "overview")
					.map((item, index) => (
						<Button
							key={item.id}
							className="overview-card"
							onClick={() => onSelectSection(item.id)}
						>
							<span className="overview-index">
								{String(index + 1).padStart(2, "0")}
							</span>
							<ArrowRight
								className="overview-card-arrow"
								size={18}
								strokeWidth={1.5}
								aria-hidden="true"
							/>
							<span className="overview-card-title">{item.label()}</span>
							<span className="overview-card-description">
								{item.description()}
							</span>
						</Button>
					))}
			</div>
			<TrafficOverview site={site.id} />
		</div>
	);
}
