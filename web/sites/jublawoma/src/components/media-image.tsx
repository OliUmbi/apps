import { m } from "@oliumbi/i18n/messages";
import { responsiveSrcSet } from "@oliumbi/ui/responsive-image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

const doodles = [
	"selfie.svg",
	"jumping.svg",
	"float.svg",
	"messy.svg",
	"groovy.svg",
	"rolling.svg",
];

export function MediaImage({
	src,
	alt,
	seed,
	className = "",
	sizes = "100vw",
	loading = "lazy",
}: Readonly<{
	src?: string | null;
	alt?: string;
	seed: string;
	className?: string;
	sizes?: string;
	loading?: "eager" | "lazy";
}>) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	if (src && failedSrc !== src)
		return (
			<img
				className={className}
				src={src}
				alt={alt || ""}
				srcSet={responsiveSrcSet(src)}
				sizes={sizes}
				loading={loading}
				onError={() => setFailedSrc(src)}
			/>
		);
	const index =
		[...seed].reduce((total, character) => total + character.charCodeAt(0), 0) %
		doodles.length;
	return (
		<div
			className={`content-image-fallback ${className}`}
			role="img"
			aria-label={alt || m.jublawoma_image_missing_alt()}
		>
			<img src={`/assets/images/doodles/${doodles[index]}`} alt="" />
			<span>
				<ImageOff size={14} />
				{m.jublawoma_image_placeholder()}
			</span>
		</div>
	);
}
