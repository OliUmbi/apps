import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { m } from "@oliumbi/i18n/messages";
import { MenuIcon, UserRound, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { StudioNavigation, StudioWorkspace } from "../model/navigation";
import { WorkspaceNavigation } from "./workspace-navigation";

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
			<div className="flex h-14 items-center gap-2.5 border-b border-border-soft px-3.5 text-sm font-semibold">
				<span className="brand-mark">O</span>
				{m.studio_name()}
			</div>
			<WorkspaceNavigation
				workspace={workspace}
				navigation={actions}
				onNavigate={() => setOpen(false)}
			/>
			<div className="account-card m-2 flex items-center gap-[9px] border-t border-border-soft pt-[13px] px-[5px] pb-[5px]">
				<Button
					className={`profile-entry ${workspace.area === "profile" ? "is-active" : ""}`}
					onClick={() => {
						actions.openProfile();
						setOpen(false);
					}}
				>
					<UserRound size={16} aria-hidden="true" />
					<span className="truncate">{actor.displayName}</span>
				</Button>
				<Button className="button" onClick={onLogout} disabled={logoutPending}>
					{m.studio_sign_out()}
				</Button>
			</div>
		</>
	);
	return (
		<div
			className={`grid min-h-screen grid-cols-[244px_minmax(0,1fr)] max-[767px]:block ${workspace.area === "administration" ? "is-administration" : ""}`}
		>
			<aside className="sticky top-0 z-30 h-screen flex-col border-r border-border-soft bg-sidebar hidden md:flex">
				{navigation}
			</aside>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger
					className="fixed left-3 top-3 z-40 rounded border border-white/15 bg-zinc-900 p-2 md:hidden"
					aria-label={m.open_navigation()}
				>
					<MenuIcon size={18} aria-hidden="true" />
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
					<Dialog.Popup className="fixed inset-y-0 left-0 z-60 flex w-72 flex-col bg-zinc-900 text-white">
						<Dialog.Title className="sr-only">{m.navigation()}</Dialog.Title>
						<Dialog.Close
							className="absolute right-3 top-3"
							aria-label={m.close()}
						>
							<X size={18} aria-hidden="true" />
						</Dialog.Close>
						{navigation}
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
			<div className="relative min-w-0">
				<header className="studio-topbar">
					<div className="workspace-context ml-12 md:ml-0">
						<small>{context.label}</small>
						<strong>{context.title}</strong>
					</div>
				</header>
				<main className="mx-auto w-[min(100%_-_48px,1280px)] pt-[38px] pb-16 max-[767px]:w-[min(100%_-_28px,1280px)] max-[767px]:pt-[26px]">
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
			title: section === "messages" ? m.studio_messages() : m.studio_accounts(),
		};
	return {
		label: site.name,
		title: site.sections.find((item) => item.id === section)?.label,
	};
}
