export interface ServiceOptions {
	name: string;
	baseUrl: () => string;
	token: () => string | undefined;
	fetch?: typeof fetch;
	timeoutMs?: number;
}
