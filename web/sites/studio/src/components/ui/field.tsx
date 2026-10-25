import { Field } from "@base-ui/react/field";
import type { ComponentProps, ReactNode } from "react";

/*
 * The shape of every editable row: label, control, then a message slot that is
 * always the same height so validation never shifts what is below it.
 *
 * `controlClass` is exported because a select trigger is a different component
 * from a text control but must look identical; sharing the string is what keeps
 * them from drifting.
 */

export const controlClass =
	"min-h-10 w-full rounded-control border border-line bg-field px-3 py-2 text-sm text-fg placeholder:text-fg-disabled transition-colors focus:border-interactive focus:outline-2 focus:outline-offset-2 focus:outline-interactive disabled:cursor-not-allowed disabled:opacity-50";

export function FieldRoot({
	children,
	...props
}: ComponentProps<typeof Field.Root>) {
	return (
		<Field.Root className="grid content-start items-start gap-1.5 text-sm" {...props}>
			{children}
		</Field.Root>
	);
}

export function FieldLabel({
	children,
	...props
}: ComponentProps<typeof Field.Label>) {
	return (
		<Field.Label
			className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle"
			{...props}
		>
			{children}
		</Field.Label>
	);
}

export function FieldControl({
	className,
	...props
}: ComponentProps<typeof Field.Control>) {
	return (
		<Field.Control
			{...props}
			className={(state) =>
				[
					controlClass,
					typeof className === "function" ? className(state) : (className ?? ""),
				].join(" ")
			}
		/>
	);
}

/*
 * A plain input with the same control shape. Use this instead of `FieldControl`
 * when the caller must own the element's `id`: Base UI's Field.Control generates
 * its own, which silently breaks an explicit label association.
 */
export function FieldInput({
	className,
	...props
}: ComponentProps<"input">) {
	return (
		<input className={[controlClass, className ?? ""].join(" ")} {...props} />
	);
}

export function FieldMessage({ hint }: { hint?: ReactNode }) {
	return (
		<div className="min-h-4">
			<Field.Error className="text-xs text-danger" />
			{hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
		</div>
	);
}
