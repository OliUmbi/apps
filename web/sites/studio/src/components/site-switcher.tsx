import { Check, ChevronsUpDown } from "lucide-react";
import type { SiteId, StudioSite } from "../studio/config";
import { Menu } from "./ui/index";
export function SiteSwitcher({
	site,
	sites,
	onSelect,
}: {
	site: StudioSite;
	sites: StudioSite[];
	onSelect: (id: SiteId) => void;
}) {
	return (
		<Menu.Root>
			<Menu.Trigger className="site-switcher-button mx-2 my-3">
				<span className="brand-mark">{site.short}</span>
				<span className="flex-1 text-left">
					<strong className="block text-sm">{site.name}</strong>
					<span className="text-xs text-muted">{site.domain}</span>
				</span>
				<ChevronsUpDown size={15} aria-hidden="true" />
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner className="z-70" sideOffset={6}>
					<Menu.Popup className="studio-menu">
						{sites.map((item) => (
							<Menu.Item
								key={item.id}
								className="studio-menu-item"
								onClick={() => onSelect(item.id)}
							>
								<span className="flex-1">{item.name}</span>
								{item.id === site.id && <Check size={15} aria-hidden="true" />}
							</Menu.Item>
						))}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
