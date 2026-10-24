import { Menu } from "@base-ui/react/menu";
import { Check, ChevronsUpDown } from "lucide-react";
import type { SiteId, StudioSite } from "../model/sites";

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
					<Menu.Popup className="w-60 rounded-md border border-[#35353b] bg-[#141416] p-[5px] text-primary shadow-[0_16px_42px_rgb(0_0_0/38%)]">
						{sites.map((item) => (
							<Menu.Item
								key={item.id}
								className="flex min-h-9 items-center gap-2 rounded px-[9px] text-sm cursor-pointer data-highlighted:bg-[#202024] data-highlighted:outline-none"
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
