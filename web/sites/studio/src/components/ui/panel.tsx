import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Body, Title } from "./text";

/*
 * A titled group of fields. Replaces the `settings-panel` CSS block; the header
 * and body are one object so panels stay consistent wherever they appear.
 */
export function Panel({
	title,
	description,
	icon: Icon,
	aside,
	children,
}: {
	title: string;
	description?: ReactNode;
	icon?: LucideIcon;
	aside?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="rounded-panel border border-line bg-layer-1">
			<header className="flex items-start gap-3 border-b border-line-subtle px-6 py-5">
				{Icon ? (
					<Icon
						size={18}
						className="mt-0.5 text-fg-subtle"
						aria-hidden="true"
					/>
				) : null}
				<div className="grid gap-1">
					<Title as="h2" size="sm">
						{title}
					</Title>
					{description ? <Body>{description}</Body> : null}
				</div>
				{aside ? <div className="ml-auto">{aside}</div> : null}
			</header>
			<div className="px-6 py-5">{children}</div>
		</section>
	);
}
