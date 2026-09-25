import { siteIds } from "@oliumbi/contracts";
import { z } from "zod";
import { getSite, type SiteId, type StudioSite, studioSites } from "./sites";

export const studioSearchSchema = z.object({
	site: z.enum(siteIds).catch("zelglihof"),
	area: z.enum(["site", "administration", "profile"]).catch("site"),
	section: z.string().catch("overview"),
	mode: z.enum(["list", "create", "detail"]).catch("list"),
	record: z.uuid().optional(),
});

export type StudioSearch = z.infer<typeof studioSearchSchema>;

export interface StudioWorkspace {
	site: StudioSite;
	allowedSites: StudioSite[];
	area: StudioSearch["area"];
	section: string;
	isAdministrator: boolean;
}

export interface StudioNavigation {
	selectSite: (site: SiteId) => void;
	selectSection: (section: string) => void;
	openAdministration: () => void;
	openProfile: () => void;
	returnToSite: () => void;
}

export function resolveStudioWorkspace(
	permissions: readonly string[],
	search: StudioSearch,
): StudioWorkspace {
	const isAdministrator = permissions.includes("studio.admin");
	const allowedSites = studioSites.filter(
		(site) => isAdministrator || permissions.includes(`${site.id}.manage`),
	);
	const site =
		allowedSites.find((site) => site.id === search.site) ??
		allowedSites[0] ??
		getSite(search.site);
	const access = { site, allowedSites, isAdministrator };

	if (search.area === "profile" || allowedSites.length === 0) {
		return { ...access, area: "profile", section: "profile" };
	}
	if (search.area === "administration" && isAdministrator) {
		const section = search.section === "messages" ? "messages" : "accounts";
		return { ...access, area: "administration", section };
	}
	const section = site.sections.some((section) => section.id === search.section)
		? search.section
		: "overview";
	return { ...access, area: "site", section };
}
