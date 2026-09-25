import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";

const renditionWidths = [
	["xs", 320],
	["sm", 640],
	["md", 768],
	["lg", 1024],
	["xl", 1280],
	["2xl", 1536],
] as const;

export interface ResponsiveImageSource {
	type: string;
	srcSet: string;
}

export function ResponsiveImage({
	src,
	alt,
	sizes = "100vw",
	sources = [],
	fallback,
	className,
	loading = "lazy",
	onError,
	...props
}: Omit<ComponentPropsWithoutRef<"img">, "src" | "alt" | "srcSet"> & {
	src?: string | null;
	alt: string;
	sizes?: string;
	sources?: readonly ResponsiveImageSource[];
	fallback?: ReactNode;
}) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	if (!src || failedSrc === src)
		return (
			<div
				role="img"
				aria-label={alt || undefined}
				aria-hidden={!alt}
				className={className}
				style={{ display: "grid", placeItems: "center" }}
			>
				{fallback ?? <span aria-hidden="true">✳</span>}
			</div>
		);

	return (
		<picture style={{ display: "contents" }}>
			{sources.map((source) => (
				<source
					key={source.type}
					type={source.type}
					srcSet={source.srcSet}
					sizes={sizes}
				/>
			))}
			<img
				{...props}
				src={src}
				srcSet={responsiveSrcSet(src)}
				sizes={sizes}
				alt={alt}
				className={className}
				loading={loading}
				onError={(event) => {
					setFailedSrc(src);
					onError?.(event);
				}}
			/>
		</picture>
	);
}

export function responsiveSrcSet(src: string): string | undefined {
	let url: URL;
	const relative = src.startsWith("/") && !src.startsWith("//");
	const protocolRelative = src.startsWith("//");
	if (!relative && !protocolRelative && !/^https?:\/\//i.test(src))
		return undefined;
	try {
		url = new URL(src, "http://local");
	} catch {
		return undefined;
	}
	if (
		(!url.pathname.startsWith("/images/") &&
			!url.pathname.startsWith("/api/assets/")) ||
		!url.searchParams.has("size")
	)
		return undefined;
	return renditionWidths
		.map(([size, width]) => {
			const rendition = new URL(url);
			rendition.searchParams.set("size", size);
			const path = `${rendition.pathname}${rendition.search}`;
			const href = relative
				? path
				: protocolRelative
					? `//${rendition.host}${path}`
					: rendition.href;
			return `${href} ${width}w`;
		})
		.join(", ");
}
