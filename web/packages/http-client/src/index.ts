import { AppError } from "@oliumbi/contracts";
import type { z } from "zod";
import { ServiceError } from "./error";
import type { ServiceOptions } from "./options";
import { emptyProblem, parseProblemBody, type ServiceProblem } from "./problem";

export { ServiceError } from "./error";
export type { ServiceOptions } from "./options";
export { pagedSchema } from "./pagination";
export type { ServiceProblem } from "./problem";
export { emptyProblem, parseProblemBody } from "./problem";

const DEFAULT_TIMEOUT_MS = 10_000;

// Reads the failure body of a service response. Only the safe fields survive
// parsing; anything unreadable becomes the empty problem.
async function readProblem(response: Response): Promise<ServiceProblem> {
	try {
		const text = await response.text();
		if (!text) return emptyProblem;
		try {
			return parseProblemBody(JSON.parse(text));
		} catch {
			return emptyProblem;
		}
	} catch {
		return emptyProblem;
	}
}

export function createHttpClient(options: ServiceOptions) {
	async function request(path: string, init: RequestInit = {}) {
		const token = options.token();
		if (!token)
			throw new AppError(
				"unauthorized",
				`${options.name} authorization is not configured`,
			);
		const headers = new Headers(init.headers);
		headers.set("Authorization", `Bearer ${token}`);
		if (typeof init.body === "string")
			headers.set("Content-Type", "application/json");
		let response: Response;
		try {
			response = await (options.fetch ?? fetch)(
				new URL(path, options.baseUrl()),
				{
					...init,
					headers,
					signal: AbortSignal.any([
						AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
						...(init.signal ? [init.signal] : []),
					]),
				},
			);
		} catch (error) {
			// A caller's own cancellation stays a cancellation (control flow);
			// every other transport failure is a typed retryable condition.
			if (init.signal?.aborted) throw error;
			throw new AppError("unavailable", `${options.name} is unavailable`, {
				cause: error,
			});
		}
		if (!response.ok)
			throw new ServiceError(
				options.name,
				response.status,
				await readProblem(response),
			);
		return response;
	}
	return {
		request,
		async json<T>(
			path: string,
			schema: z.ZodType<T>,
			init?: RequestInit,
		): Promise<T> {
			const response = await request(path, init);
			let body: unknown;
			try {
				body = await response.json();
			} catch (error) {
				throw new AppError(
					"internal",
					`${options.name} returned an unexpected response`,
					{ cause: error },
				);
			}
			const parsed = schema.safeParse(body);
			if (!parsed.success)
				throw new AppError(
					"internal",
					`${options.name} returned an unexpected response`,
					{ cause: parsed.error },
				);
			return parsed.data;
		},
		async empty(path: string, init?: RequestInit): Promise<void> {
			await request(path, init);
		},
	};
}
