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
		<div className="grid gap-[30px]">
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
			<div className="grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
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
							<span className="col-span-full self-end text-primary text-base font-semibold">
								{item.label}
							</span>
							<span className="col-[1/3] text-muted text-[0.77rem] leading-[1.5]">
								{item.description()}
							</span>
							<ArrowUpRight
								className="self-end justify-self-end text-faint"
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
			className="col-start-3 text-[#a79ff4]"
			size={19}
			strokeWidth={1.6}
			aria-hidden="true"
		/>
	);
}
