import {
	Bell,
	ChevronDown,
	FileText,
	Home,
	Inbox,
	LayoutGrid,
	LogOut,
	Mail,
	Menu,
	Package,
	Search,
	Settings,
	Users,
	X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import type { SiteId, StudioSection, StudioSite } from "../studio/config";
import { studioSites } from "../studio/config";

const icons = {
	home: Home,
	inbox: Inbox,
	content: FileText,
	people: Users,
	commerce: Package,
	newsletter: Mail,
} as const;

export function StudioShell({
	site,
	section,
	actor,
	onSelectSite,
	onSelectSection,
	onLogout,
	children,
}: Readonly<{
	site: StudioSite;
	section: string;
	actor: { displayName: string; username?: string };
	onSelectSite: (site: SiteId) => void;
	onSelectSection: (section: string) => void;
	onLogout: () => Promise<void>;
	children: ReactNode;
}>) {
	const [mobileOpen, setMobileOpen] = useState(false);
	return (
		<div className="studio-app">
			<button
				type="button"
				className="mobile-menu"
				onClick={() => setMobileOpen(true)}
				aria-label="Navigation öffnen"
			>
				<Menu size={18} />
			</button>
			{mobileOpen ? (
				<button
					type="button"
					className="sidebar-backdrop"
					onClick={() => setMobileOpen(false)}
					aria-label="Navigation schliessen"
				/>
			) : null}
			<aside className={`studio-sidebar ${mobileOpen ? "is-open" : ""}`}>
				<div className="sidebar-brand">
					<span className="brand-mark">O</span>
					<span>Studio</span>
					<button
						type="button"
						className="icon-button ml-auto md:hidden"
						onClick={() => setMobileOpen(false)}
						aria-label="Navigation schliessen"
					>
						<X size={16} />
					</button>
				</div>
				<SiteSwitcher
					site={site}
					onSelect={(id) => {
						onSelectSite(id);
						setMobileOpen(false);
					}}
				/>
				<nav className="site-navigation" aria-label={`${site.name} Navigation`}>
					<p className="nav-caption">{site.name}</p>
					{site.sections.map((item) => (
						<SectionButton
							key={item.id}
							item={item}
							active={item.id === section}
							onClick={() => {
								onSelectSection(item.id);
								setMobileOpen(false);
							}}
						/>
					))}
				</nav>
				<nav className="site-navigation mt-auto" aria-label="Studio Navigation">
					<p className="nav-caption">Studio</p>
					<button type="button" className="nav-item">
						<LayoutGrid size={16} /> Medien <span className="planned-dot" />
					</button>
					<button type="button" className="nav-item">
						<Settings size={16} /> Einstellungen{" "}
						<span className="planned-dot" />
					</button>
				</nav>
				<div className="account-card">
					<span className="avatar">{initials(actor.displayName)}</span>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-primary">
							{actor.displayName}
						</p>
						<p className="truncate text-xs text-muted">Administrator</p>
					</div>
					<button
						type="button"
						className="icon-button"
						onClick={onLogout}
						title="Abmelden"
						aria-label="Abmelden"
					>
						<LogOut size={15} />
					</button>
				</div>
			</aside>
			<div className="studio-main">
				<header className="studio-topbar">
					<div className="breadcrumb">
						<span>{site.name}</span>
						<span className="text-faint">/</span>
						<strong>
							{site.sections.find((item) => item.id === section)?.label ??
								"Übersicht"}
						</strong>
					</div>
					<div className="topbar-actions">
						<button type="button" className="search-trigger">
							<Search size={14} />
							<span>Suchen</span>
							<kbd>⌘ K</kbd>
						</button>
						<button type="button" className="icon-button">
							<Bell size={16} />
							<span className="notification-dot" />
						</button>
					</div>
				</header>
				<main className="studio-content">{children}</main>
			</div>
		</div>
	);
}

function SiteSwitcher({
	site,
	onSelect,
}: Readonly<{ site: StudioSite; onSelect: (site: SiteId) => void }>) {
	const [open, setOpen] = useState(false);
	return (
		<div className="site-switcher">
			<button
				type="button"
				className="site-switcher-button"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
			>
				<SiteBadge site={site} />
				<span className="min-w-0 flex-1 text-left">
					<strong className="block truncate text-sm">{site.name}</strong>
					<span className="block truncate text-xs text-muted">
						{site.domain}
					</span>
				</span>
				<ChevronDown size={14} className="text-muted" />
			</button>
			{open ? (
				<div className="site-menu">
					{studioSites.map((item) => (
						<button
							type="button"
							key={item.id}
							className={
								item.id === site.id ? "site-option is-active" : "site-option"
							}
							onClick={() => {
								onSelect(item.id);
								setOpen(false);
							}}
						>
							<SiteBadge site={item} />
							<span>
								<strong>{item.name}</strong>
								<small>{item.domain}</small>
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

function SiteBadge({ site }: Readonly<{ site: StudioSite }>) {
	return (
		<span
			className="site-badge"
			style={{ "--site-accent": site.accent } as CSSProperties}
		>
			{site.short}
		</span>
	);
}
function SectionButton({
	item,
	active,
	onClick,
}: Readonly<{ item: StudioSection; active: boolean; onClick: () => void }>) {
	const Icon = icons[item.icon];
	return (
		<button
			type="button"
			className={active ? "nav-item is-active" : "nav-item"}
			onClick={onClick}
		>
			<Icon size={16} /> {item.label}
			{item.status === "planned" ? <span className="planned-dot" /> : null}
		</button>
	);
}
function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}
