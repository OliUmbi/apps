import { idSchema } from "@oliumbi/contracts";
import { imageSizes, imageUrl } from "./urls";

const REQUEST_TIMEOUT_MS = 10_000;

export async function proxyPublicImage(request: Request, id: string) {
	const parsedId = idSchema.safeParse(id);
	if (!parsedId.success) return new Response(null, { status: 400 });
	const requestedSize = new URL(request.url).searchParams.get("size");
	const size = imageSizes.find((size) => size === requestedSize) ?? "xl";
	const requestHeaders = new Headers();
	const validator = request.headers.get("If-None-Match");
	if (validator) requestHeaders.set("If-None-Match", validator);
	const response = await fetch(
		imageUrl(
			process.env.ASSETS_SERVICE_URL ??
				process.env.ASSETS_PUBLIC_URL ??
				"http://localhost:8083",
			parsedId.data,
			size,
		),
		{
			headers: requestHeaders,
			signal: AbortSignal.any([
				request.signal,
				AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			]),
		},
	);
	const headers = new Headers({ "X-Content-Type-Options": "nosniff" });
	for (const name of ["Content-Type", "Cache-Control", "ETag"]) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}
	if (response.status === 304)
		return new Response(null, { status: 304, headers });
	if (!response.ok) {
		await response.body?.cancel();
		return new Response(null, { status: response.status });
	}
	return new Response(response.body, { status: response.status, headers });
}
