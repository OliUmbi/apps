import { idSchema } from "@oliumbi/contracts";
import { imageSizes, imageUrl } from "./urls";

const allowedSizes = new Set<string>(imageSizes);

export async function proxyPublicImage(request: Request, id: string) {
	const requestedSize = new URL(request.url).searchParams.get("size") ?? "xl";
	const size = allowedSizes.has(requestedSize) ? requestedSize : "xl";
	const response = await fetch(
		imageUrl(
			process.env.ASSETS_PUBLIC_URL ?? "http://localhost:8083",
			idSchema.parse(id),
			size as (typeof imageSizes)[number],
		),
	);

	if (!response.ok || !response.body)
		return new Response(null, { status: response.status });

	const headers = new Headers({
		"Content-Type": response.headers.get("Content-Type") ?? "image/jpeg",
		"Cache-Control":
			response.headers.get("Cache-Control") ?? "public, max-age=3600",
		"X-Content-Type-Options": "nosniff",
	});
	const etag = response.headers.get("ETag");
	if (etag) headers.set("ETag", etag);

	return new Response(response.body, {
		status: response.status,
		headers,
	});
}
