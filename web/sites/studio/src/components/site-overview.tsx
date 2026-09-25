import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import {
	ArrowUpRight,
	FileText,
	Inbox,
	Mail,
	ShoppingBasket,
	Users,
} from "lucide-react";
import type { StudioSite } from "../model/sites";

export function SiteOverview({
	site,
	onSelectSection,
}: {
	site: StudioSite;
	onSelectSection: (section: string) => void;
}) {
	return (
		<div className="content-stack overview-page">
			<header className="overview-heading">
				<div>
					<p className="page-kicker">{site.domain}</p>
					<h1>{site.name}</h1>
					<p>{m.studio_dashboard_workspaces_title()}</p>
				</div>
				<div
					className="overview-monogram"
					style={{ borderColor: site.accent, color: site.accent }}
				>
					{site.short}
				</div>
			</header>
			<div className="overview-grid">
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
							<OverviewIcon icon={item.icon} />
							<span className="overview-label">{item.label}</span>
							<span className="overview-description">
								{sectionDescription(item.icon)}
							</span>
							<ArrowUpRight className="overview-arrow" size={17} />
						</Button>
					))}
			</div>
		</div>
	);
}

function OverviewIcon({
	icon,
}: {
	icon: StudioSite["sections"][number]["icon"];
}) {
	const Icon = {
		inbox: Inbox,
		content: FileText,
		people: Users,
		commerce: ShoppingBasket,
		newsletter: Mail,
		home: FileText,
	}[icon];
	return (
		<Icon
			className="overview-icon"
			size={19}
			strokeWidth={1.6}
			aria-hidden="true"
		/>
	);
}

function sectionDescription(icon: StudioSite["sections"][number]["icon"]) {
	return {
		inbox: m.studio_overview_inbox(),
		content: m.studio_overview_content(),
		people: m.studio_overview_people(),
		commerce: m.studio_overview_commerce(),
		newsletter: m.studio_overview_newsletter(),
		home: m.studio_overview_content(),
	}[icon];
}
