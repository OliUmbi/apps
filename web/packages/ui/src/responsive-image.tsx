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
				aria-label={alt}
				className={className}
				style={{ display: "grid", placeItems: "center" }}
			>
				{fallback ?? <span aria-hidden="true">✳</span>}
			</div>
		);

	return (
		<picture style={{ display: "contents" }}>
			{sources.map((source) => (
				<source key={source.type} type={source.type} srcSet={source.srcSet} />
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
	try {
		url = new URL(src);
	} catch {
		return undefined;
	}
	if (!url.pathname.startsWith("/images/") || !url.searchParams.has("size"))
		return undefined;
	return renditionWidths
		.map(([size, width]) => {
			const rendition = new URL(url);
			rendition.searchParams.set("size", size);
			return `${rendition.href} ${width}w`;
		})
		.join(", ");
}
