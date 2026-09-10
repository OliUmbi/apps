import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Route } from "../routes/index";
import { logoutFromStudio } from "../server/session.functions";
import { getSite, isResourceId, studioSites } from "../studio/config";
import { AccountsView } from "./accounts-view";
import { AssetsView } from "./assets-view";
import { MessagesView } from "./messages-view";
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
	const allowedSites = studioSites.filter(
		(site) =>
			actor.permissions.includes("studio.admin") ||
			actor.permissions.includes(`${site.id}.manage`),
	);
	const configuredSite =
		allowedSites.find((site) => site.id === search.site) ??
		allowedSites[0] ??
		getSite(search.site);
	const site = {
		...configuredSite,
		sections: actor.permissions.includes("studio.admin")
			? [
					...configuredSite.sections,
					{
						id: "accounts",
						label: m.studio_accounts(),
						icon: "people" as const,
					},
					{
						id: "messages",
						label: m.studio_messages(),
						icon: "inbox" as const,
					},
				]
			: configuredSite.sections,
	};
	const section = site.sections.some((item) => item.id === search.section)
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
		void navigate({ search: { site: site.id, section } });
	};
	if (!allowedSites.length)
		return (
			<main className="login-page">
				<div className="login-panel">
					<p>{m.studio_no_access()}</p>
					<Button className="button" onClick={() => signOut.mutate({})}>
						{m.studio_components_studio_shell_text_3()}
					</Button>
				</div>
			</main>
		);
	return (
		<StudioShell
			site={site}
			allowedSites={allowedSites}
			section={section}
			actor={actor}
			onSelectSite={(site) => {
				void navigate({ search: { site, section: "overview" } });
			}}
			onSelectSection={selectSection}
			onLogout={async () => {
				signOut.mutate({});
			}}
		>
			<FormFeedback error={signOut.isError ? m.error_generic() : null} />
			{section === "accounts" ? (
				<AccountsView />
			) : section === "messages" ? (
				<MessagesView />
			) : isResourceId(section) ? (
				<ResourceView key={section} resourceId={section} />
			) : section === "images" || section === "documents" ? (
				<AssetsView
					key={`${site.id}-${section}`}
					site={site.id}
					kind={section}
				/>
			) : (
				<div className="content-stack">
					<header className="page-heading">
						<div>
							<p className="page-kicker">{site.domain}</p>
							<h1>{site.name}</h1>
							<p>{m.studio_components_dashboard_paragraph()}</p>
						</div>
					</header>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{site.sections
							.filter((item) => item.id !== "overview")
							.map((item) => (
								<Button
									key={item.id}
									className="panel p-6 text-left hover:border-current"
									onClick={() => selectSection(item.id)}
								>
									{item.label} →
								</Button>
							))}
					</div>
				</div>
			)}
		</StudioShell>
	);
}
