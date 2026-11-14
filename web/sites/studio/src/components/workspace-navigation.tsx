import { m } from "@oliumbi/i18n/messages";
import type { StudioNavigation, StudioWorkspace } from "../model/navigation";
import { AdministrationNavigation } from "./administration-navigation";
import { SiteNavigation } from "./site-navigation";
import { SiteSwitcher } from "./site-switcher";
import { Body } from "./ui/text";

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

	if (allowedSites.length === 0) {
		return (
			<div className="p-4">
				<Body>{m.studio_no_access()}</Body>
			</div>
		);
	}

	return (
		<>
			<div className="border-b border-line-subtle p-3">
				<SiteSwitcher
					sites={allowedSites}
					site={site}
					onSelect={(next) => select(() => navigation.selectSite(next))}
				/>
			</div>
			<SiteNavigation
				site={site}
				section={area === "site" ? section : null}
				onSelect={(next) => select(() => navigation.selectSection(next))}
			/>
			{isAdministrator && (
				<AdministrationNavigation
					section={area === "administration" ? section : null}
					onSelect={(next) => select(() => navigation.selectSection(next))}
				/>
			)}
		</>
	);
}
