import type { ReactNode } from "react";
import { Kicker, Title } from "./text";

/*
 * The bar across the top of the content column. Carries the workspace context:
 * a kicker for which site or area you are in, and the current screen name.
 */
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
		<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line-subtle bg-canvas/90 px-4 backdrop-blur">
			{leading}
			<div className="grid leading-tight">
				<Kicker>{label}</Kicker>
				<Title as="span" size="sm">
					{title}
				</Title>
			</div>
		</header>
	);
}
