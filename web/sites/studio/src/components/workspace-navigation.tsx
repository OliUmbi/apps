import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { ArrowLeft, Settings2 } from "lucide-react";
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

	if (area === "administration") {
		return (
			<AdministrationNavigation
				section={section}
				onLeave={() => select(navigation.returnToSite)}
				onSelect={(next) => select(() => navigation.selectSection(next))}
			/>
		);
	}

	if (area === "profile") {
		if (allowedSites.length === 0)
			return (
				<div className="p-3">
					<Body>{m.studio_no_access()}</Body>
				</div>
			);
		return (
			<div className="p-2">
				<Button
					className="w-full justify-start"
					onClick={() => select(navigation.returnToSite)}
				>
					<ArrowLeft size={15} aria-hidden="true" />
					{m.studio_websites()}
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="p-2">
				<SiteSwitcher
					sites={allowedSites}
					site={site}
					onSelect={(next) => select(() => navigation.selectSite(next))}
				/>
			</div>
			<SiteNavigation
				site={site}
				section={section}
				onSelect={(next) => select(() => navigation.selectSection(next))}
			/>
			{isAdministrator && (
				<div className="p-2">
					<Button
						className="w-full justify-start"
						onClick={() => select(navigation.openAdministration)}
					>
						<Settings2 size={15} aria-hidden="true" />
						{m.studio_administration()}
					</Button>
				</div>
			)}
		</>
	);
}
