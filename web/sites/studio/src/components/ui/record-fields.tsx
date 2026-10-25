import type { ReactNode } from "react";
import { Kicker } from "./text";

/*
 * The read-only detail layout: a two-column definition list. Replaces the
 * `record-fields` CSS block and its `dt`/`dd` element rules.
 */

export function RecordFields({ children }: { children: ReactNode }) {
	return (
		<dl className="grid grid-cols-2 gap-x-8 max-md:grid-cols-1">{children}</dl>
	);
}

export function RecordField({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="border-b border-line-subtle py-4">
			<dt>
				<Kicker>{label}</Kicker>
			</dt>
			<dd className="mt-1.5 whitespace-pre-wrap break-words text-sm text-fg-muted">
				{children}
			</dd>
		</div>
	);
}
