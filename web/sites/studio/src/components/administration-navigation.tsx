import { m } from "@oliumbi/i18n/messages";
import { ArrowLeft, Mail, Users } from "lucide-react";
import { Button } from "./ui/index";

const administrationSections = [
	{ id: "accounts", label: m.studio_accounts, icon: Users },
	{ id: "messages", label: m.studio_messages, icon: Mail },
] as const;

export function AdministrationNavigation({
	section,
	onSelect,
	onLeave,
}: {
	section: string;
	onSelect: (section: string) => void;
	onLeave: () => void;
}) {
	return (
		<>
			<Button className="workspace-switch" onClick={onLeave}>
				<ArrowLeft size={15} aria-hidden="true" />
				{m.studio_websites()}
			</Button>
			<nav aria-label={m.studio_administration()} className="site-navigation">
				<p className="nav-caption">{m.studio_administration()}</p>
				{administrationSections.map((item) => {
					const Icon = item.icon;
					return (
						<Button
							key={item.id}
							className={
								item.id === section ? "nav-item is-active" : "nav-item"
							}
							onClick={() => onSelect(item.id)}
							aria-current={item.id === section ? "page" : undefined}
						>
							<Icon size={15} strokeWidth={1.7} aria-hidden="true" />
							{item.label()}
						</Button>
					);
				})}
			</nav>
		</>
	);
}
