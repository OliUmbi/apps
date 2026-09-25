import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useSignOut } from "../hooks/use-sign-out";
import { useStudioNavigation } from "../hooks/use-studio-navigation";
import { isContentSection } from "../model/content-sections";
import {
	resolveStudioWorkspace,
	type StudioWorkspace,
} from "../model/navigation";
import { Route } from "../routes/index";
import { AccountsView } from "./accounts-view";
import { AppShell } from "./app-shell";
import { AssetsView } from "./assets-view";
import { ContentView } from "./content/content-view";
import { MessagesView } from "./messages-view";
import { ProfileView } from "./profile-view";
import { SiteOverview } from "./site-overview";

export function DashboardView({
	actor,
}: {
	actor: { displayName: string; username: string; permissions: string[] };
}) {
	const workspace = resolveStudioWorkspace(
		actor.permissions,
		Route.useSearch(),
	);
	const navigation = useStudioNavigation(workspace);
	const signOut = useSignOut();
	return (
		<AppShell
			workspace={workspace}
			navigation={navigation}
			actor={actor}
			onLogout={() => signOut.mutate({})}
			logoutPending={signOut.isPending}
		>
			<FormFeedback error={signOut.isError ? m.error_generic() : null} />
			<WorkspaceContent
				workspace={workspace}
				onSelectSection={navigation.selectSection}
			/>
		</AppShell>
	);
}

function WorkspaceContent({
	workspace: { site, area, section },
	onSelectSection,
}: {
	workspace: StudioWorkspace;
	onSelectSection: (section: string) => void;
}) {
	if (area === "profile") return <ProfileView />;
	if (area === "administration") {
		return section === "messages" ? <MessagesView /> : <AccountsView />;
	}
	if (isContentSection(section))
		return <ContentView key={section} section={section} />;
	if (section === "images" || section === "documents") {
		return (
			<AssetsView key={`${site.id}-${section}`} site={site.id} kind={section} />
		);
	}
	return <SiteOverview site={site} onSelectSection={onSelectSection} />;
}
