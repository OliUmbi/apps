export interface QueuedEmail {
	id: string;
	site: string;
	sender: string;
	recipient: string;
	subject: string;
	text: string;
	html: string;
}
