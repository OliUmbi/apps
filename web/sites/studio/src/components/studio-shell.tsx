import { m } from "@oliumbi/i18n/messages";
import { ArrowLeft, MenuIcon, Settings2, UserRound, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { SiteId, StudioSite } from "../studio/config";
import { AdministrationNavigation } from "./administration-navigation";
import { SiteNavigation } from "./site-navigation";
import { SiteSwitcher } from "./site-switcher";
import { Button, Dialog } from "./ui/index";
export function StudioShell({
	site,
	allowedSites,
	section,
	administration,
	profile,
	isAdministrator,
	actor,
	onSelectSite,
	onSelectSection,
	onSelectAdministration,
	onSelectProfile,
	onLeaveAdministration,
	onLogout,
	children,
}: {
	site: StudioSite;
	allowedSites: StudioSite[];
	section: string;
	administration: boolean;
	profile: boolean;
	isAdministrator: boolean;
	actor: { displayName: string };
	onSelectSite: (site: SiteId) => void;
	onSelectSection: (section: string) => void;
	onSelectAdministration: () => void;
	onSelectProfile: () => void;
	onLeaveAdministration: () => void;
	onLogout: () => Promise<void>;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const navigation = (
		<>
			<div className="sidebar-brand">
				<span className="brand-mark">
					{m.studio_components_studio_shell_text()}
				</span>
				{m.studio_components_studio_shell_text_2()}
			</div>
			{administration ? (
				<AdministrationNavigation
					section={section}
					onLeave={() => {
						onLeaveAdministration();
						setOpen(false);
					}}
					onSelect={(value) => {
						onSelectSection(value);
						setOpen(false);
					}}
				/>
			) : profile && allowedSites.length > 0 ? (
				<Button
					className="workspace-switch"
					onClick={() => {
						onLeaveAdministration();
						setOpen(false);
					}}
				>
					<ArrowLeft size={15} aria-hidden="true" />
					{m.studio_websites()}
				</Button>
			) : profile ? (
				<p className="profile-access-note">{m.studio_no_access()}</p>
			) : (
				<>
					<SiteSwitcher
						sites={allowedSites}
						site={site}
						onSelect={(id) => {
							onSelectSite(id);
							setOpen(false);
						}}
					/>
					<SiteNavigation
						site={site}
						section={section}
						onSelect={(value) => {
							onSelectSection(value);
							setOpen(false);
						}}
					/>
					{isAdministrator && (
						<Button
							className="admin-entry"
							onClick={() => {
								onSelectAdministration();
								setOpen(false);
							}}
						>
							<Settings2 size={15} aria-hidden="true" />
							{m.studio_administration()}
						</Button>
					)}
				</>
			)}
			<div className="account-card mt-auto">
				<Button
					className={`profile-entry ${profile ? "is-active" : ""}`}
					onClick={() => {
						onSelectProfile();
						setOpen(false);
					}}
				>
					<UserRound size={16} aria-hidden="true" />
					<span className="truncate">{actor.displayName}</span>
				</Button>
				<Button className="button" onClick={onLogout}>
					{m.studio_components_studio_shell_text_3()}
				</Button>
			</div>
		</>
	);
	return (
		<div className="studio-app">
			<aside className="studio-sidebar hidden md:flex">{navigation}</aside>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger
					className="fixed left-3 top-3 z-40 rounded border border-white/15 bg-zinc-900 p-2 md:hidden"
					aria-label={m.studio_components_studio_shell_aria_label()}
				>
					<MenuIcon size={18} aria-hidden="true" />
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
					<Dialog.Popup className="fixed inset-y-0 left-0 z-60 flex w-72 flex-col bg-zinc-900 text-white">
						<Dialog.Title className="sr-only">
							{m.studio_components_studio_shell_text_4()}
						</Dialog.Title>
						<Dialog.Close
							className="absolute right-3 top-3"
							aria-label={m.studio_components_studio_shell_aria_label_2()}
						>
							<X size={18} aria-hidden="true" />
						</Dialog.Close>
						{navigation}
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
			<div className="studio-main">
				<header className="studio-topbar">
					<div className="breadcrumb ml-12 md:ml-0">
						<span>
							{administration
								? m.studio_system()
								: profile
									? m.studio_personal_workspace()
									: site.name}
						</span>
						<span>/</span>
						<strong>
							{profile
								? m.studio_my_profile()
								: administration
									? section === "messages"
										? m.studio_messages()
										: m.studio_accounts()
									: site.sections.find((item) => item.id === section)?.label}
						</strong>
					</div>
				</header>
				<main className="studio-content">{children}</main>
			</div>
		</div>
	);
}
