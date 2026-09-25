import { m } from "@oliumbi/i18n/messages";

export const contentSections = [
	{
		id: "jublawoma.promotion",
		site: "jublawoma",
		label: "Promotionen",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.story",
		site: "jublawoma",
		label: "Geschichten",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.event",
		site: "jublawoma",
		label: "Anlässe",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.member",
		site: "jublawoma",
		label: "Leitungsteam",
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "jublawoma.donation",
		site: "jublawoma",
		label: "Spendenaktionen",
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "unclet.showcase",
		site: "unclet",
		label: "Einblicke",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "unclet.review",
		site: "unclet",
		label: "Bewertungen",
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "unclet.inquiry",
		site: "unclet",
		label: "Anfragen",
		description: m.studio_overview_inbox,
		icon: "inbox",
	},
	{
		id: "zelglihof.promotion",
		site: "zelglihof",
		label: "Promotionen",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "zelglihof.article",
		site: "zelglihof",
		label: "Aktuelles",
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "zelglihof.product",
		site: "zelglihof",
		label: "Produkte",
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "zelglihof.product_reservation",
		site: "zelglihof",
		label: "Reservationen",
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "zelglihof.subscriber",
		site: "zelglihof",
		label: "Abonnenten",
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "zelglihof.campaign",
		site: "zelglihof",
		label: "Kampagnen",
		description: m.studio_overview_newsletter,
		icon: "newsletter",
	},
	{
		id: "zelglihof.inquiry",
		site: "zelglihof",
		label: "Anfragen",
		description: m.studio_overview_inbox,
		icon: "inbox",
	},
] as const;

export type ContentSection = (typeof contentSections)[number]["id"];

export function isContentSection(value: string): value is ContentSection {
	return contentSections.some((section) => section.id === value);
}
