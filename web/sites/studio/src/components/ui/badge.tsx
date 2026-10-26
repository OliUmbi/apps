import type { ReactNode } from "react";

/*
 * Small status marker. Monospace so states line up in lists, and rounded so it
 * reads as a token rather than a control. `className` is layout placement from
 * the view only (grid cell, row gap); the look stays here.
 */

const tones = {
	neutral: "border-line-subtle bg-layer-2 text-fg-muted",
	success: "border-success/30 bg-success/10 text-success",
	danger: "border-danger/30 bg-danger/10 text-danger",
} as const;

export function Badge({
	tone = "neutral",
	className,
	children,
}: {
	tone?: keyof typeof tones;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={`inline-flex h-6 items-center rounded-full border px-2.5 font-mono text-xs ${tones[tone]} ${className ?? ""}`}
		>
			{children}
		</span>
	);
}
