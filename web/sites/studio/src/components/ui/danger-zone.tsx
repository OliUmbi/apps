import type { ReactNode } from "react";
import { Body, Title } from "./text";

/*
 * The destructive end of a record: delete, revoke, remove. Separated by a red
 * hairline so it reads as a different kind of action from the rest of the
 * screen, and never sits next to the save actions.
 */
export function DangerZone({
	title,
	description,
	actions,
}: {
	title: string;
	description?: ReactNode;
	actions: ReactNode;
}) {
	return (
		<section className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-danger/30 pt-5">
			<div className="grid gap-1">
				<Title as="h2" size="sm">
					{title}
				</Title>
				{description ? <Body>{description}</Body> : null}
			</div>
			<div className="flex flex-wrap gap-2">{actions}</div>
		</section>
	);
}
