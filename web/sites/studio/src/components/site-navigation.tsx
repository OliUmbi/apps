import type { StudioSite } from "../studio/config";
import { Button } from "./ui/index";
export function SiteNavigation({
	site,
	section,
	onSelect,
}: {
	site: StudioSite;
	section: string;
	onSelect: (section: string) => void;
}) {
	return (
		<nav aria-label={site.name} className="site-navigation overflow-y-auto">
			<p className="nav-caption">{site.name}</p>
			{site.sections.map((item) => (
				<Button
					key={item.id}
					className={item.id === section ? "nav-item is-active" : "nav-item"}
					onClick={() => onSelect(item.id)}
					aria-current={item.id === section ? "page" : undefined}
				>
					{item.label}
				</Button>
			))}
		</nav>
	);
}
