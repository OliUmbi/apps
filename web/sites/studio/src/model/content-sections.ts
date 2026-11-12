import { m } from "@oliumbi/i18n/messages";

export const contentSections = [
	{
		id: "jublawoma.promotion",
		site: "jublawoma",
		label: m.studio_section_promotion,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.story",
		site: "jublawoma",
		label: m.studio_section_story,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.event",
		site: "jublawoma",
		label: m.studio_section_event,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "jublawoma.member",
		site: "jublawoma",
		label: m.studio_section_member,
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "jublawoma.donation",
		site: "jublawoma",
		label: m.studio_section_donation,
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "jublawoma.donation_commitment",
		site: "jublawoma",
		label: m.studio_section_donation_commitment,
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "unclet.showcase",
		site: "unclet",
		label: m.studio_section_showcase,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "unclet.review",
		site: "unclet",
		label: m.studio_section_review,
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "unclet.inquiry",
		site: "unclet",
		label: m.studio_section_inquiry,
		description: m.studio_overview_inbox,
		icon: "inbox",
	},
	{
		id: "zelglihof.promotion",
		site: "zelglihof",
		label: m.studio_section_promotion,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "zelglihof.article",
		site: "zelglihof",
		label: m.studio_section_article,
		description: m.studio_overview_content,
		icon: "content",
	},
	{
		id: "zelglihof.product",
		site: "zelglihof",
		label: m.studio_section_product,
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "zelglihof.product_reservation",
		site: "zelglihof",
		label: m.studio_section_product_reservation,
		description: m.studio_overview_commerce,
		icon: "commerce",
	},
	{
		id: "zelglihof.subscriber",
		site: "zelglihof",
		label: m.studio_section_subscriber,
		description: m.studio_overview_people,
		icon: "people",
	},
	{
		id: "zelglihof.campaign",
		site: "zelglihof",
		label: m.studio_section_campaign,
		description: m.studio_overview_newsletter,
		icon: "newsletter",
	},
	{
		id: "zelglihof.inquiry",
		site: "zelglihof",
		label: m.studio_section_inquiry,
		description: m.studio_overview_inbox,
		icon: "inbox",
	},
] as const;

export type ContentSection = (typeof contentSections)[number]["id"];

export function isContentSection(value: string): value is ContentSection {
	return contentSections.some((section) => section.id === value);
}
