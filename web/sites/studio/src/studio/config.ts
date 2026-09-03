export const siteIds = ["zelglihof", "unclet", "jublawoma", "oliumbi"] as const;
export type SiteId = (typeof siteIds)[number];

export interface StudioSection {
	id: string;
	label: string;
	icon: "home" | "inbox" | "content" | "people" | "commerce" | "newsletter";
	status?: "ready" | "planned";
}

export interface StudioSite {
	id: SiteId;
	name: string;
	domain: string;
	short: string;
	accent: string;
	sections: StudioSection[];
}

export const studioSites: StudioSite[] = [
	{
		id: "zelglihof",
		name: "Zelglihof",
		domain: "zelglihof.ch",
		short: "ZH",
		accent: "#7ca680",
		sections: [
			{ id: "overview", label: "Übersicht", icon: "home", status: "ready" },
			{
				id: "reservations",
				label: "Reservationen",
				icon: "inbox",
				status: "planned",
			},
			{
				id: "products",
				label: "Produkte",
				icon: "commerce",
				status: "planned",
			},
			{ id: "updates", label: "Aktuelles", icon: "content", status: "planned" },
			{
				id: "newsletter",
				label: "Newsletter",
				icon: "newsletter",
				status: "ready",
			},
		],
	},
	{
		id: "unclet",
		name: "Uncle-T",
		domain: "uncle-t.ch",
		short: "UT",
		accent: "#b99a5b",
		sections: [
			{ id: "overview", label: "Übersicht", icon: "home", status: "ready" },
			{ id: "inquiries", label: "Anfragen", icon: "inbox", status: "ready" },
			{ id: "events", label: "Einblicke", icon: "content", status: "planned" },
			{
				id: "reviews",
				label: "Bewertungen",
				icon: "people",
				status: "planned",
			},
		],
	},
	{
		id: "jublawoma",
		name: "Jubla Woma",
		domain: "jublawoma.ch",
		short: "JW",
		accent: "#9181d6",
		sections: [
			{ id: "overview", label: "Übersicht", icon: "home", status: "ready" },
			{ id: "events", label: "Anlässe", icon: "content", status: "ready" },
			{
				id: "stories",
				label: "Geschichten",
				icon: "content",
				status: "ready",
			},
			{ id: "members", label: "Mitglieder", icon: "people", status: "planned" },
			{
				id: "donations",
				label: "Spendenaktionen",
				icon: "commerce",
				status: "planned",
			},
		],
	},
	{
		id: "oliumbi",
		name: "Oliumbi",
		domain: "oliumbi.ch",
		short: "OL",
		accent: "#6699cc",
		sections: [
			{ id: "overview", label: "Übersicht", icon: "home", status: "ready" },
			{ id: "projects", label: "Projekte", icon: "content", status: "planned" },
			{
				id: "profile",
				label: "Profil & CV",
				icon: "people",
				status: "planned",
			},
		],
	},
];

export function getSite(id: string): StudioSite {
	const fallback = studioSites[0];
	if (!fallback)
		throw new Error("Studio requires at least one configured site");
	return studioSites.find((site) => site.id === id) ?? fallback;
}
