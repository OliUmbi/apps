import type { ReactNode } from "react";
import { Body, Kicker, Title } from "./text";

/*
 * The top of every screen: a kicker, the screen name, optional supporting copy
 * and the actions belonging to the page as a whole.
 */
export function PageHeader({
	kicker,
	title,
	description,
	actions,
}: {
	kicker?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="flex min-h-20 flex-wrap items-end justify-between gap-6">
			<div className="grid gap-1.5">
				{kicker ? <Kicker>{kicker}</Kicker> : null}
				<Title as="h1" size="lg">
					{title}
				</Title>
				{description ? <Body>{description}</Body> : null}
			</div>
			{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
		</header>
	);
}
