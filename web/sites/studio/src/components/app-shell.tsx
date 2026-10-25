import { m } from "@oliumbi/i18n/messages";
import { MenuIcon, UserRound } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { StudioNavigation, StudioWorkspace } from "../model/navigation";
import { Brand } from "./ui/brand";
import { Button, IconButton } from "./ui/button";
import { Drawer, DrawerClose } from "./ui/drawer";
import { Sidebar, SidebarFooter, SidebarHeader } from "./ui/sidebar";
import { TopBar } from "./ui/top-bar";
import { WorkspaceNavigation } from "./workspace-navigation";

/*
 * The application frame: navigation rail on the left, context bar and content
 * on the right. Structure only; every visual detail is a leaf in `ui/`.
 */
export function AppShell({
	workspace,
	navigation: actions,
	actor,
	onLogout,
	logoutPending,
	children,
}: {
	workspace: StudioWorkspace;
	navigation: StudioNavigation;
	actor: { displayName: string };
	onLogout: () => void;
	logoutPending: boolean;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const context = workspaceContext(workspace);

	const navigation = (
		<>
			<WorkspaceNavigation
				workspace={workspace}
				navigation={actions}
				onNavigate={() => setOpen(false)}
			/>
			<SidebarFooter>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						className="flex-1 justify-start"
						onClick={() => {
							actions.openProfile();
							setOpen(false);
						}}
					>
						<UserRound size={16} aria-hidden="true" />
						<span className="truncate">{actor.displayName}</span>
					</Button>
					<Button size="sm" onClick={onLogout} disabled={logoutPending}>
						{m.studio_sign_out()}
					</Button>
				</div>
			</SidebarFooter>
		</>
	);

	return (
		<div className="flex min-h-dvh">
			<Sidebar>
				<SidebarHeader>
					<Brand name={m.studio_name()} />
				</SidebarHeader>
				{navigation}
			</Sidebar>

			<Drawer open={open} onOpenChange={setOpen} title={m.navigation()}>
				<SidebarHeader action={<DrawerClose label={m.close()} />}>
					<Brand name={m.studio_name()} />
				</SidebarHeader>
				{navigation}
			</Drawer>

			<div className="flex min-w-0 flex-1 flex-col">
				<TopBar
					leading={
						<IconButton
							label={m.open_navigation()}
							className="md:hidden"
							onClick={() => setOpen(true)}
						>
							<MenuIcon size={18} aria-hidden="true" />
						</IconButton>
					}
					label={context.label}
					title={context.title}
				/>
				<main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
			</div>
		</div>
	);
}

function workspaceContext({ site, area, section }: StudioWorkspace) {
	if (area === "profile")
		return {
			label: m.studio_personal_workspace(),
			title: m.studio_my_profile(),
		};
	if (area === "administration")
		return {
			label: m.studio_system(),
			title: section === "messages" ? m.studio_messages() : m.studio_accounts(),
		};
	return {
		label: site.name,
		title: site.sections.find((item) => item.id === section)?.label,
	};
}
