import { m } from "@oliumbi/i18n/messages";
import { History, type LucideIcon, Mail, Users } from "lucide-react";
import type { StudioSectionId } from "../model/navigation";
import { Nav, NavItem, NavSection } from "./ui/nav";

const administrationSections: {
	id: "accounts" | "messages" | "audit";
	label: () => string;
	icon: LucideIcon;
}[] = [
	{ id: "accounts", label: m.studio_accounts, icon: Users },
	{ id: "messages", label: m.studio_messages, icon: Mail },
	{ id: "audit", label: m.studio_audit, icon: History },
];

export function AdministrationNavigation({
	section,
	onSelect,
}: {
	section: StudioSectionId | null;
	onSelect: (section: StudioSectionId) => void;
}) {
	return (
		<Nav label={m.studio_administration()}>
			<NavSection title={m.studio_administration()}>
				{administrationSections.map((item) => (
					<NavItem
						key={item.id}
						icon={item.icon}
						active={item.id === section}
						onClick={() => onSelect(item.id)}
					>
						{item.label()}
					</NavItem>
				))}
			</NavSection>
		</Nav>
	);
}
