import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { ArrowLeft, Settings2 } from "lucide-react";
import type { StudioNavigation, StudioWorkspace } from "../model/navigation";
import { AdministrationNavigation } from "./administration-navigation";
import { SiteNavigation } from "./site-navigation";
import { SiteSwitcher } from "./site-switcher";

export function WorkspaceNavigation({
	workspace,
	navigation,
	onNavigate,
}: {
	workspace: StudioWorkspace;
	navigation: StudioNavigation;
	onNavigate: () => void;
}) {
	const { site, allowedSites, area, section, isAdministrator } = workspace;
	function select(action: () => void) {
		action();
		onNavigate();
	}
	if (area === "administration") {
		return (
			<AdministrationNavigation
				section={section}
				onLeave={() => select(navigation.returnToSite)}
				onSelect={(section) => select(() => navigation.selectSection(section))}
			/>
		);
	}
	if (area === "profile") {
		if (allowedSites.length === 0)
			return <p className="profile-access-note">{m.studio_no_access()}</p>;
		return (
			<Button
				className="workspace-switch"
				onClick={() => select(navigation.returnToSite)}
			>
				<ArrowLeft size={15} aria-hidden="true" />
				{m.studio_websites()}
			</Button>
		);
	}
	return (
		<>
			<SiteSwitcher
				sites={allowedSites}
				site={site}
				onSelect={(site) => select(() => navigation.selectSite(site))}
			/>
			<SiteNavigation
				site={site}
				section={section}
				onSelect={(section) => select(() => navigation.selectSection(section))}
			/>
			{isAdministrator && (
				<Button
					className="admin-entry"
					onClick={() => select(navigation.openAdministration)}
				>
					<Settings2 size={15} aria-hidden="true" />
					{m.studio_administration()}
				</Button>
			)}
		</>
	);
}
