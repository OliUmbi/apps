export interface Subscriber {
	id: string;
	email: string;
	status: string;
	requested_at: Date;
	confirmed_at: Date | null;
	unsubscribed_at: Date | null;
	confirmation_token_hash: string;
	unsubscribe_token: string;
}
export interface NewsletterOptions {
	publicUrl: string;
	sender: string;
}
