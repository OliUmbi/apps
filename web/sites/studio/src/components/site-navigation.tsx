import {
	FileText,
	Home,
	Inbox,
	type LucideIcon,
	Mail,
	ShoppingBasket,
	Users,
} from "lucide-react";
import type { StudioSite } from "../model/sites";
import { Nav, NavItem, NavSection } from "./ui/nav";

const icons: Record<StudioSite["sections"][number]["icon"], LucideIcon> = {
	home: Home,
	inbox: Inbox,
	content: FileText,
	people: Users,
	commerce: ShoppingBasket,
	newsletter: Mail,
};

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
		<Nav label={site.name}>
			<NavSection title={site.name}>
				{site.sections.map((item) => (
					<NavItem
						key={item.id}
						icon={icons[item.icon]}
						active={item.id === section}
						onClick={() => onSelect(item.id)}
					>
						{item.label}
					</NavItem>
				))}
			</NavSection>
		</Nav>
	);
}
