export const contentSections = [
	{
		id: "jublawoma.promotion",
		site: "jublawoma",
		label: "Promotionen",
		icon: "content",
	},
	{
		id: "jublawoma.story",
		site: "jublawoma",
		label: "Geschichten",
		icon: "content",
	},
	{
		id: "jublawoma.event",
		site: "jublawoma",
		label: "Anlässe",
		icon: "content",
	},
	{
		id: "jublawoma.member",
		site: "jublawoma",
		label: "Leitungsteam",
		icon: "people",
	},
	{
		id: "jublawoma.donation",
		site: "jublawoma",
		label: "Spendenaktionen",
		icon: "commerce",
	},
	{
		id: "unclet.showcase",
		site: "unclet",
		label: "Einblicke",
		icon: "content",
	},
	{ id: "unclet.review", site: "unclet", label: "Bewertungen", icon: "people" },
	{ id: "unclet.inquiry", site: "unclet", label: "Anfragen", icon: "inbox" },
	{
		id: "zelglihof.promotion",
		site: "zelglihof",
		label: "Promotionen",
		icon: "content",
	},
	{
		id: "zelglihof.article",
		site: "zelglihof",
		label: "Aktuelles",
		icon: "content",
	},
	{
		id: "zelglihof.product",
		site: "zelglihof",
		label: "Produkte",
		icon: "commerce",
	},
	{
		id: "zelglihof.product_reservation",
		site: "zelglihof",
		label: "Reservationen",
		icon: "commerce",
	},
	{
		id: "zelglihof.subscriber",
		site: "zelglihof",
		label: "Abonnenten",
		icon: "people",
	},
	{
		id: "zelglihof.campaign",
		site: "zelglihof",
		label: "Kampagnen",
		icon: "newsletter",
	},
	{
		id: "zelglihof.inquiry",
		site: "zelglihof",
		label: "Anfragen",
		icon: "inbox",
	},
] as const;

export type ContentSection = (typeof contentSections)[number]["id"];

export function isContentSection(value: string): value is ContentSection {
	return contentSections.some((section) => section.id === value);
}
