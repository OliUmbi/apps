import { siteIds } from "@oliumbi/contracts";
import { z } from "zod";
import { type ContentSection, contentSections } from "./content-sections";
import { getSite, type SiteId, type StudioSite, studioSites } from "./sites";

// The URL vocabulary: the content registry plus the studio's own screens.
const studioChromeSections = [
	"overview",
	"images",
	"documents",
	"profile",
	"accounts",
	"messages",
] as const;

export type StudioSectionId =
	| (typeof studioChromeSections)[number]
	| ContentSection;

const studioSectionIds: readonly StudioSectionId[] = [
	...studioChromeSections,
	...contentSections.map((section) => section.id),
];

function isStudioSectionId(value: unknown): value is StudioSectionId {
	return (
		typeof value === "string" &&
		studioSectionIds.includes(value as StudioSectionId)
	);
}

export const studioSearchSchema = z.object({
	site: z.enum(siteIds).catch("zelglihof"),
	area: z.enum(["site", "administration", "profile"]).catch("site"),
	// Deep links outside the known vocabulary fall back to the overview, so
	// the section cannot be a plain enum.
	section: z.custom<StudioSectionId>(isStudioSectionId).catch("overview"),
	mode: z.enum(["list", "create", "detail"]).catch("list"),
	record: z.uuid().optional(),
});

export type StudioSearch = z.infer<typeof studioSearchSchema>;

export interface StudioWorkspace {
	site: StudioSite;
	allowedSites: StudioSite[];
	area: StudioSearch["area"];
	section: StudioSectionId;
	isAdministrator: boolean;
}

export interface StudioNavigation {
	selectSite: (site: SiteId) => void;
	selectSection: (section: StudioSectionId) => void;
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
