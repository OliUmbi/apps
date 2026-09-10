export interface Campaign {
	id: string;
	subject: string;
	body: string;
	status: string;
}
export interface CampaignRecipient {
	id: string;
	email: string;
	unsubscribeToken: string;
}
export interface CampaignOptions {
	sender: string;
	publicUrl: string;
}
