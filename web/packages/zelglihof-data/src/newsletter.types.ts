export interface NewsletterOptions {
	publicUrl: string;
	/** sending identity for subscriber mail (newsletter@) */
	sender: string;
	/** human inbox replies go to (requests@) */
	replyTo: string;
}
