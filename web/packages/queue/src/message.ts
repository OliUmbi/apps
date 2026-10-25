export interface QueuedEmail {
	id: string;
	site: string;
	sender: string;
	recipient: string;
	replyTo: string | null;
	subject: string;
	text: string;
	html: string;
}
