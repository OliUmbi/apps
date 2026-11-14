import type { SiteId } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { contentSections } from "./content-sections";
import type { StudioSectionId } from "./navigation";

export { type SiteId, siteIds } from "@oliumbi/contracts";
export interface StudioSection {
	id: StudioSectionId;
	label: () => string;
	description: () => string;
	icon: "home" | "inbox" | "content" | "people" | "commerce" | "newsletter";
}
export interface StudioSite {
	id: SiteId;
	name: string;
	domain: string;
	short: string;
	accent: string;
	sections: StudioSection[];
}
const siteDetails = [
	{
		id: "zelglihof",
		name: "Zelglihof",
		domain: "zelglihof-maegenwil.ch",
		short: "ZH",
		accent: "#7ca680",
	},
	{
		id: "unclet",
		name: "Uncle-T",
		domain: "uncle-t.ch",
		short: "UT",
		accent: "#b99a5b",
	},
	{
		id: "jublawoma",
		name: "Jubla WOMA",
		domain: "jublawoma.ch",
		short: "JW",
		accent: "#9baf85",
	},
	{
		id: "oliumbi",
		name: "Oliumbi",
		domain: "oliumbi.ch",
		short: "OL",
		accent: "#6699cc",
	},
] as const;
export const studioSites: StudioSite[] = siteDetails.map((site) => ({
	...site,
	sections: [
		{
			id: "overview",
			label: m.studio_section_overview,
			description: m.studio_dashboard_workspaces_title,
			icon: "home",
		},

		...contentSections
			.filter((section) => section.site === site.id)
			.map(({ id, label, description, icon }) => ({
				id,
				label,
				description,
				icon,
			})),
		{
			id: "images",
			label: m.studio_section_images,
			description: m.studio_overview_images,
			icon: "content",
		},
		{
			id: "documents",
			label: m.studio_section_documents,
			description: m.studio_overview_documents,
			icon: "content",
		},
	],
}));
export function getSite(id: string): StudioSite {
	return studioSites.find((site) => site.id === id) ?? studioSites[0];
}
