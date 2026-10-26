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
		<div className="grid gap-8">
			<header className="overview-heading">
				<div>
					{/* Hero and cards are the documented plain-CSS exception (see the
					    dashboard-hero comment in styles.css). `page-kicker` must stay:
					    `.overview-heading p:not(.page-kicker)` restyles any other
					    paragraph. */}
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
			<div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
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
							<span className="col-span-full self-end text-fg text-base font-semibold">
								{item.label}
							</span>
							<span className="col-span-2 text-fg-subtle text-xs leading-relaxed">
								{item.description()}
							</span>
							<ArrowUpRight
								className="self-end justify-self-end text-fg-disabled"
								size={17}
							/>
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
			className="col-start-3 text-interactive"
			size={19}
			strokeWidth={1.6}
			aria-hidden="true"
		/>
	);
}
