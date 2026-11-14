import type { ReactNode } from "react";

/* The sign-in artwork becomes a compact banner on small screens; the form keeps
 * its natural height and never gets trapped in a viewport-sized scroll area. */
export function Split({
	scenery,
	children,
}: {
	scenery: ReactNode;
	children: ReactNode;
}) {
	return (
		<main className="grid min-h-dvh w-full md:grid-cols-[3fr_2fr]">
			{scenery}
			<div className="flex items-start justify-center md:items-center">
				{children}
			</div>
		</main>
	);
}
