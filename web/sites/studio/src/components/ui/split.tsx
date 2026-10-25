import type { ReactNode } from "react";

/*
 * Page-level split: one panel of scenery, one panel of content. Side by side on
 * desktop, stacked as two equal halves on a phone. Layout only, no visuals.
 */

export function Split({
	scenery,
	children,
}: {
	scenery: ReactNode;
	children: ReactNode;
}) {
	return (
		<main className="grid h-dvh w-full grid-rows-2 md:grid-cols-2 md:grid-rows-1">
			{scenery}
			<div className="flex items-start justify-center md:items-center">
				{children}
			</div>
		</main>
	);
}
