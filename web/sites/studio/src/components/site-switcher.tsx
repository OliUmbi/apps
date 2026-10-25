import { Check, ChevronsUpDown } from "lucide-react";
import type { SiteId, StudioSite } from "../model/sites";
import { Brand } from "./ui/brand";
import { MenuItem, MenuPanel, MenuRoot, MenuTrigger } from "./ui/menu";

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
		<MenuRoot>
			<MenuTrigger>
				<Brand monogram={site.short} name={site.name} detail={site.domain} />
				<ChevronsUpDown
					size={15}
					className="ml-auto shrink-0"
					aria-hidden="true"
				/>
			</MenuTrigger>
			<MenuPanel>
				{sites.map((item) => (
					<MenuItem key={item.id} onClick={() => onSelect(item.id)}>
						<span className="flex-1">{item.name}</span>
						{item.id === site.id && <Check size={15} aria-hidden="true" />}
					</MenuItem>
				))}
			</MenuPanel>
		</MenuRoot>
	);
}
