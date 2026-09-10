import type { SiteId } from "@oliumbi/contracts";
import { type ResourceId, resources } from "./resources";

export { type SiteId, siteIds } from "@oliumbi/contracts";
export interface StudioSection {
	id: string;
	label: string;
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
		domain: "zelglihof.ch",
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
		name: "Jubla Woma",
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
		{ id: "overview", label: "Übersicht", icon: "home" },
		...Object.entries(resources)
			.filter(([id]) => id.startsWith(`${site.id}.`))
			.map(([id, resource]) => ({
				id,
				label: resource.label,
				icon: "content" as const,
			})),
		{ id: "images", label: "Bilder", icon: "content" },
		{ id: "documents", label: "Dokumente", icon: "content" },
	],
}));
export function getSite(id: string): StudioSite {
	return studioSites.find((site) => site.id === id) ?? studioSites[0];
}
export function isResourceId(id: string): id is ResourceId {
	return Object.hasOwn(resources, id);
}
