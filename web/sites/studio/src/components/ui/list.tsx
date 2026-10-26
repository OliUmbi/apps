import type { ComponentProps, ElementType, ReactNode } from "react";

/*
 * List chrome shared by the account, message and attempt lists. Rows sit in a
 * hairline-gap stack: the shell's fill shows through the 1px gaps, so the
 * separators cost the rows no borders.
 *
 * Row heights are floors, not fixes - a row carries two lines of text and a
 * fixed height squashes it - and only colours change on hover or state, so
 * nothing in the stack ever moves.
 */

export function ListShell({
	as: Tag = "div",
	children,
}: {
	as?: ElementType;
	children: ReactNode;
}) {
	return (
		<Tag className="grid gap-px overflow-hidden rounded-panel border border-line-subtle bg-line-subtle">
			{children}
		</Tag>
	);
}

const rowClasses = {
	trailing:
		"grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 bg-layer-1 px-4 py-4 text-left transition-colors hover:bg-layer-2 max-md:grid-cols-[auto_minmax(0,1fr)]",
	bare: "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-4 bg-layer-1 px-4 py-4 text-left transition-colors hover:bg-layer-2",
} as const;

export function ListRow({
	leading,
	trailing,
	children,
	...props
}: ComponentProps<"button"> & {
	leading: ReactNode;
	trailing?: ReactNode;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className={`min-h-9 ${trailing ? rowClasses.trailing : rowClasses.bare}`}
			{...props}
		>
			{leading}
			<div className="grid min-w-0 gap-1">{children}</div>
			{trailing ? (
				<div className="flex items-center gap-4 max-md:col-start-2 max-md:justify-self-start">
					{trailing}
				</div>
			) : null}
		</button>
	);
}

/*
 * The trailing column of a row: a right-aligned main line over a smaller detail
 * line, so counts and timestamps line up down the list.
 */
export function ListMeta({
	children,
	detail,
}: {
	children: ReactNode;
	detail?: ReactNode;
}) {
	return (
		<div className="grid justify-items-end gap-1 text-xs text-fg-muted">
			{children}
			{detail ? <span className="text-fg-subtle">{detail}</span> : null}
		</div>
	);
}

export function Avatar({ children }: { children: ReactNode }) {
	return (
		<div className="grid size-9 shrink-0 place-items-center rounded-control border border-line bg-layer-2 text-sm font-semibold text-fg-muted">
			{children}
		</div>
	);
}
