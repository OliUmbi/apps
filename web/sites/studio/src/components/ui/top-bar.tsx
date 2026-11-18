import type { ReactNode } from "react";
import { Kicker } from "./text";

/* A single-line breadcrumb preserves vertical space for the actual workspace. */
export function TopBar({
	leading,
	label,
	title,
}: {
	leading?: ReactNode;
	label: ReactNode;
	title: ReactNode;
}) {
	return (
		<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line-subtle bg-canvas/95 px-4 backdrop-blur md:px-8">
			{leading}
			<div className="flex min-w-0 items-baseline gap-2">
				<Kicker>{label}</Kicker>
				<span className="text-fg-disabled" aria-hidden="true">
					/
				</span>
				<span className="truncate text-sm font-medium text-fg">{title}</span>
			</div>
		</header>
	);
}
