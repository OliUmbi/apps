import { type ImageName, imageDimensions, imageVersion } from "../model/images";

const variants = [480, 800, 1200] as const;
const directory = "/images/people";

type StaticImageProps = {
	name: ImageName;
	alt: string;
	sizes: string;
	priority?: boolean;
	className?: string;
};

function avifSrcSet(name: ImageName) {
	const { width } = imageDimensions[name];
	return [
		...variants
			.filter((variant) => variant < width)
			.map(
				(variant) =>
					`${directory}/${name}-${variant}.avif?v=${imageVersion} ${variant}w`,
			),
		`${directory}/${name}-full.avif?v=${imageVersion} ${width}w`,
	].join(", ");
}

/**
 * Preload hint for the image that is expected to be the largest paint. Without
 * it the browser only discovers the picture once the document has been parsed
 * past the hero, which pushes LCP back by a full round trip.
 */
export function imagePreload(name: ImageName, sizes: string) {
	return {
		rel: "preload",
		as: "image",
		type: "image/avif",
		imageSrcSet: avifSrcSet(name),
		imageSizes: sizes,
		fetchPriority: "high" as const,
	};
}

/**
 * Responsive static photo. AVIF is the primary format; the owner JPEG is the
 * fallback for browsers without AVIF. Width/height reserve space before the
 * image loads, so the layout does not shift.
 */
export function StaticImage({
	name,
	alt,
	sizes,
	priority = false,
	className,
}: StaticImageProps) {
	const { width, height } = imageDimensions[name];

	return (
		<picture className="block">
			<source type="image/avif" srcSet={avifSrcSet(name)} sizes={sizes} />
			<img
				src={`${directory}/${name}.jpg?v=${imageVersion}`}
				width={width}
				height={height}
				alt={alt}
				loading={priority ? "eager" : "lazy"}
				fetchPriority={priority ? "high" : undefined}
				decoding="async"
				className={className}
			/>
		</picture>
	);
}
