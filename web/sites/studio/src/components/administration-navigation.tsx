import { m } from "@oliumbi/i18n/messages";
import { ArrowLeft, History, type LucideIcon, Mail, Users } from "lucide-react";
import type { StudioSectionId } from "../model/navigation";
import { Button } from "./ui/button";
import { Nav, NavItem } from "./ui/nav";

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
	onLeave,
}: {
	section: StudioSectionId;
	onSelect: (section: StudioSectionId) => void;
	onLeave: () => void;
}) {
	return (
		<>
			<div className="p-2">
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={onLeave}
				>
					<ArrowLeft size={15} aria-hidden="true" />
					{m.studio_websites()}
				</Button>
			</div>
			<Nav label={m.studio_administration()}>
				{administrationSections.map((item) => {
					const Icon = item.icon;
					return (
						<NavItem
							key={item.id}
							icon={Icon}
							active={item.id === section}
							onClick={() => onSelect(item.id)}
						>
							{item.label()}
						</NavItem>
					);
				})}
			</Nav>
		</>
	);
}
