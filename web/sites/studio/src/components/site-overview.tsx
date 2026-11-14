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
import type { StudioSectionId } from "../model/navigation";
import type { StudioSite } from "../model/sites";

export function SiteOverview({
	site,
	onSelectSection,
}: {
	site: StudioSite;
	onSelectSection: (section: StudioSectionId) => void;
}) {
	return (
		<div className="grid gap-10">
			<header className="overview-heading">
				<div>
					{/* The display composition is the documented plain-CSS exception. */}
					<p className="page-kicker">{site.domain}</p>
					<h1>{site.name}</h1>
					<p>{m.studio_dashboard_workspaces_title()}</p>
				</div>
			</header>
			<div className="overview-grid grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
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
							<span className="col-span-full self-end text-lg font-semibold tracking-tight text-fg">
								{item.label()}
							</span>
							<span className="col-span-2 text-sm leading-6 text-fg-subtle">
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
