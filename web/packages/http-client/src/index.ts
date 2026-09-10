import type { z } from "zod";
import { ServiceError } from "./error";
import type { ServiceOptions } from "./options";

export { ServiceError } from "./error";
export type { ServiceOptions } from "./options";
export { pagedSchema } from "./pagination";

const DEFAULT_TIMEOUT_MS = 10_000;
export function createHttpClient(options: ServiceOptions) {
	async function request(path: string, init: RequestInit = {}) {
		const token = options.token();
		if (!token)
			throw new Error(`${options.name} authorization is not configured`);
		const headers = new Headers(init.headers);
		headers.set("Authorization", `Bearer ${token}`);
		if (typeof init.body === "string")
			headers.set("Content-Type", "application/json");
		const response = await (options.fetch ?? fetch)(
			new URL(path, options.baseUrl()),
			{
				...init,
				headers,
				signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
			},
		);
		if (!response.ok) throw new ServiceError(options.name, response.status);
		return response;
	}
	return {
		request,
		async json<T>(
			path: string,
			schema: z.ZodType<T>,
			init?: RequestInit,
		): Promise<T> {
			return schema.parse(await (await request(path, init)).json());
		},
		async empty(path: string, init?: RequestInit): Promise<void> {
			await request(path, init);
		},
	};
}
