import type { ReactNode } from "react";

/*
 * Decorative scenery surface: an aurora gradient under a grain overlay. The
 * preset names are literal on purpose so Tailwind can see the utilities.
 */

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
		<div className={`flex items-end p-8 noise ${presets[preset]}`}>
			{children}
		</div>
	);
}
