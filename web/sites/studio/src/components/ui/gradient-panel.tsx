import type { ReactNode } from "react";

/* The colourful aurora is Studio's only decorative surface. */
const presets = {
	aurora: "gradient-aurora",
	dusk: "gradient-dusk",
	tide: "gradient-tide",
	ember: "gradient-ember",
} as const;

export function GradientPanel({
	preset = "tide",
	children,
}: {
	preset?: keyof typeof presets;
	children?: ReactNode;
}) {
	return (
		<div
			className={`relative flex min-h-52 items-end overflow-hidden p-8 noise md:min-h-dvh md:p-12 ${presets[preset]}`}
		>
			<div className="login-grid" aria-hidden="true" />
			{children}
		</div>
	);
}
