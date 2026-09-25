import type {
	StudioNavigation,
	StudioSearch,
	StudioWorkspace,
} from "../model/navigation";
import { Route } from "../routes/index";

export function useStudioNavigation(
	workspace: StudioWorkspace,
): StudioNavigation {
	const navigate = Route.useNavigate();
	const { site, area } = workspace;

	function openSection(
		destination: Pick<StudioSearch, "site" | "area" | "section">,
	) {
		void navigate({
			search: { ...destination, mode: "list", record: undefined },
		});
	}

	return {
		selectSite: (site) =>
			openSection({ site, area: "site", section: "overview" }),
		selectSection: (section) => openSection({ site: site.id, area, section }),
		openAdministration: () =>
			openSection({
				site: site.id,
				area: "administration",
				section: "accounts",
			}),
		openProfile: () =>
			openSection({ site: site.id, area: "profile", section: "profile" }),
		returnToSite: () =>
			openSection({ site: site.id, area: "site", section: "overview" }),
	};
}
