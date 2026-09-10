import { useState } from "react";
export function AssetImage({
	src,
	alt,
	className = "",
}: {
	src?: string | null;
	alt: string;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);
	if (!src || failed)
		return (
			<div
				role="img"
				aria-label={alt}
				className={`grid aspect-[4/3] place-items-center bg-current/5 ${className}`}
			>
				<span aria-hidden="true" className="text-5xl opacity-30">
					✳
				</span>
			</div>
		);
	return (
		<img
			src={src}
			alt={alt}
			className={className}
			loading="lazy"
			onError={() => setFailed(true)}
		/>
	);
}
