export class ServiceError extends Error {
	constructor(
		readonly service: string,
		readonly status: number,
	) {
		super(`${service} request failed (${status})`);
	}
}
