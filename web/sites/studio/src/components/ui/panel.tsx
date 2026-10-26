import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Body, Kicker, Title } from "./text";

/*
 * A titled group of fields. Replaces the `settings-panel` CSS block; the header
 * and body are one object so panels stay consistent wherever they appear.
 * `className` exists so a panel can take layout placement (a grid column, a
 * stretch) from its view without the view touching its appearance.
 */
export function Panel({
	kicker,
	title,
	description,
	icon: Icon,
	aside,
	className,
	children,
}: {
	kicker?: ReactNode;
	title: string;
	description?: ReactNode;
	icon?: LucideIcon;
	aside?: ReactNode;
	className?: string;
	children: ReactNode;
}) {
	return (
		<section
			className={[
				"rounded-panel border border-line bg-layer-1",
				className ?? "",
			].join(" ")}
		>
			<header className="flex items-start gap-3 border-b border-line-subtle px-6 py-5">
				{Icon ? (
					<Icon
						size={18}
						className="mt-0.5 text-fg-subtle"
						aria-hidden="true"
					/>
				) : null}
				<div className="grid gap-1">
					{kicker ? <Kicker>{kicker}</Kicker> : null}
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
