import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowUpRight,
	FileText,
	Inbox,
	Mail,
	ShoppingBasket,
	Users,
} from "lucide-react";
import { Route } from "../routes/index";
import { logoutFromStudio } from "../server/session.functions";
import {
	getSite,
	isResourceId,
	type StudioSite,
	studioSites,
} from "../studio/config";
import { AccountsView } from "./accounts-view";
import { AssetsView } from "./assets-view";
import { MessagesView } from "./messages-view";
import { ProfileView } from "./profile-view";
import { ResourceView } from "./resource-view";
import { StudioShell } from "./studio-shell";
import { Button, FormFeedback } from "./ui/index";

export function Dashboard({
	actor,
}: {
	actor: { displayName: string; username: string; permissions: string[] };
}) {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const router = useRouter();
	const cache = useQueryClient();
	const logout = useServerFn(logoutFromStudio);
	const isAdministrator = actor.permissions.includes("studio.admin");
	const allowedSites = studioSites.filter(
		(site) =>
			actor.permissions.includes("studio.admin") ||
			actor.permissions.includes(`${site.id}.manage`),
	);
	const configuredSite =
		allowedSites.find((site) => site.id === search.site) ??
		allowedSites[0] ??
		getSite(search.site);
	const site = configuredSite;
	const administration = isAdministrator && search.area === "administration";
	const profile = search.area === "profile" || !allowedSites.length;
	const administrationSections = ["accounts", "messages"];
	const section = profile
		? "profile"
		: administration
			? administrationSections.includes(search.section)
				? search.section
				: "accounts"
			: site.sections.some((item) => item.id === search.section)
				? search.section
				: "overview";
	const signOut = useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			cache.clear();
			await router.invalidate();
		},
	});
	const selectSection = (section: string) => {
		void navigate({
			search: {
				site: site.id,
				area: administration ? "administration" : "site",
				section,
				mode: "list",
				record: undefined,
			},
		});
	};
	return (
		<StudioShell
			site={site}
			allowedSites={allowedSites}
			section={section}
			administration={administration}
			profile={profile}
			isAdministrator={isAdministrator}
			actor={actor}
			onSelectSite={(site) => {
				void navigate({
					search: {
						site,
						area: "site",
						section: "overview",
						mode: "list",
						record: undefined,
					},
				});
			}}
			onSelectSection={selectSection}
			onSelectAdministration={() => {
				void navigate({
					search: {
						site: site.id,
						area: "administration",
						section: "accounts",
						mode: "list",
						record: undefined,
					},
				});
			}}
			onSelectProfile={() => {
				void navigate({
					search: {
						site: site.id,
						area: "profile",
						section: "profile",
						mode: "list",
						record: undefined,
					},
				});
			}}
			onLeaveAdministration={() => {
				void navigate({
					search: {
						site: site.id,
						area: "site",
						section: "overview",
						mode: "list",
						record: undefined,
					},
				});
			}}
			onLogout={async () => {
				signOut.mutate({});
			}}
		>
			<FormFeedback error={signOut.isError ? m.error_generic() : null} />
			<SectionContent
				section={section}
				site={site}
				administration={administration}
				profile={profile}
				onSelectSection={selectSection}
			/>
		</StudioShell>
	);
}

function SectionContent({
	section,
	site,
	onSelectSection,
	administration,
	profile,
}: {
	section: string;
	site: StudioSite;
	administration: boolean;
	profile: boolean;
	onSelectSection: (section: string) => void;
}) {
	if (profile) return <ProfileView />;
	if (administration && section === "accounts") return <AccountsView />;
	if (administration && section === "messages") return <MessagesView />;
	if (isResourceId(section))
		return <ResourceView key={section} resourceId={section} />;
	if (section === "images" || section === "documents")
		return (
			<AssetsView key={`${site.id}-${section}`} site={site.id} kind={section} />
		);
	return (
		<div className="content-stack overview-page">
			<header className="overview-heading">
				<div>
					<p className="page-kicker">{site.domain}</p>
					<h1>{site.name}</h1>
					<p>{m.studio_components_dashboard_paragraph()}</p>
				</div>
				<div
					className="overview-monogram"
					style={{ borderColor: site.accent, color: site.accent }}
				>
					{site.short}
				</div>
			</header>
			<div className="overview-grid">
				{site.sections
					.filter((item) => item.id !== "overview")
					.map((item, index) => (
						<Button
							key={item.id}
							className="overview-card"
							onClick={() => onSelectSection(item.id)}
						>
							<span className="overview-index">
								{String(index + 1).padStart(2, "0")}
							</span>
							<OverviewIcon icon={item.icon} />
							<span className="overview-label">{item.label}</span>
							<span className="overview-description">
								{sectionDescription(item.icon)}
							</span>
							<ArrowUpRight className="overview-arrow" size={17} />
						</Button>
					))}
			</div>
		</div>
	);
}

function OverviewIcon({
	icon,
}: {
	icon: StudioSite["sections"][number]["icon"];
}) {
	const Icon = {
		inbox: Inbox,
		content: FileText,
		people: Users,
		commerce: ShoppingBasket,
		newsletter: Mail,
		home: FileText,
	}[icon];
	return (
		<Icon
			className="overview-icon"
			size={19}
			strokeWidth={1.6}
			aria-hidden="true"
		/>
	);
}

function sectionDescription(icon: StudioSite["sections"][number]["icon"]) {
	return {
		inbox: m.studio_overview_inbox(),
		content: m.studio_overview_content(),
		people: m.studio_overview_people(),
		commerce: m.studio_overview_commerce(),
		newsletter: m.studio_overview_newsletter(),
		home: m.studio_overview_content(),
	}[icon];
}
