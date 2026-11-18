import type {
	StudioNavigation,
	StudioSearch,
	StudioWorkspace,
} from "../model/navigation";
import { useStudioSearch } from "./use-studio-search";

export function useStudioNavigation(
	workspace: StudioWorkspace,
): StudioNavigation {
	const { navigate } = useStudioSearch();
	const { site } = workspace;

	function openSection(
		destination: Pick<StudioSearch, "site" | "area" | "section">,
	) {
		navigate({ ...destination, mode: "list", record: undefined });
	}

	return {
		selectSite: (site) =>
			openSection({ site, area: "site", section: "overview" }),
		selectSection: (section) =>
			openSection({
				site: site.id,
				area:
					section === "accounts" ||
					section === "messages" ||
					section === "audit"
						? "administration"
						: "site",
				section,
			}),

		openProfile: () =>
			openSection({ site: site.id, area: "profile", section: "profile" }),
	};
}
