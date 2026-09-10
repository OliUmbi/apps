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
				⌄
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner className="z-70" sideOffset={6}>
					<Menu.Popup className="w-60 rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-white shadow-xl">
						{sites.map((item) => (
							<Menu.Item
								key={item.id}
								className="rounded p-3 data-highlighted:bg-white/10"
								onClick={() => onSelect(item.id)}
							>
								{item.name}
							</Menu.Item>
						))}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
