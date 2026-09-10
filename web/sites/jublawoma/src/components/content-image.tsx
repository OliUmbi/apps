import { m } from "@oliumbi/i18n/messages";
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

export function ContentImage({
	src,
	alt,
	seed,
	className = "",
}: Readonly<{
	src?: string | null;
	alt?: string;
	seed: string;
	className?: string;
}>) {
	const [failed, setFailed] = useState(false);
	if (src && !failed)
		return (
			<img
				className={className}
				src={src}
				alt={alt || ""}
				onError={() => setFailed(true)}
			/>
		);
	const index =
		[...seed].reduce((total, character) => total + character.charCodeAt(0), 0) %
		doodles.length;
	return (
		<div
			className={`content-image-fallback ${className}`}
			role="img"
			aria-label={alt || m.jublawoma_components_content_image_feedback()}
		>
			<img src={`/assets/images/doodles/${doodles[index]}`} alt="" />
			<span>
				<ImageOff size={14} />
				{m.jublawoma_components_content_image_text()}
			</span>
		</div>
	);
}
