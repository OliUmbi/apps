import { emailMessage } from "@oliumbi/queue/email";
import type {
	Campaign,
	CampaignOptions,
	CampaignRecipient,
} from "./campaign.types";
export function campaignEmail(
	campaign: Campaign,
	recipient: CampaignRecipient,
	options: CampaignOptions,
) {
	const unsubscribe = new URL(
		`/newsletter/unsubscribe/${recipient.unsubscribeToken}`,
		options.publicUrl,
	).href;
	return emailMessage(
		"zelglihof",
		options.sender,
		recipient.email,
		campaign.subject,
		`${campaign.body}\n\nNewsletter abbestellen: ${unsubscribe}`,
	);
}
