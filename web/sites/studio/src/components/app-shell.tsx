import { m } from "@oliumbi/i18n/messages";
import { MenuIcon, UserRound } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
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
	const main = useRef<HTMLElement>(null);
	const initialView = useRef(true);
	const context = workspaceContext(workspace);
	const viewKey = `${workspace.site.id}:${workspace.area}:${workspace.section}`;
	useEffect(() => {
		if (initialView.current) {
			initialView.current = false;
			return;
		}
		main.current?.focus();
	}, [viewKey]);

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
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-layer-2 focus:px-4 focus:py-2 focus:text-fg"
				href="#main"
			>
				{m.skip_to_content()}
			</a>
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
				<main
					ref={main}
					id="main"
					tabIndex={-1}
					className="mx-auto w-full max-w-[90rem] px-4 py-6 md:px-8 md:py-10"
				>
					{children}
				</main>
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
			title:
				section === "messages"
					? m.studio_messages()
					: section === "audit"
						? m.studio_audit()
						: m.studio_accounts(),
		};
	return {
		label: site.name,
		title: site.sections.find((item) => item.id === section)?.label(),
	};
}
