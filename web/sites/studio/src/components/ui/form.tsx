import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps, ReactNode } from "react";

/*
 * The detail and edit screen layout: fields down one column, actions in a rail
 * beside them.
 *
 * Fields are deliberately one per row. A two column grid makes the reading
 * order zig-zag across rows and pairs fields by position rather than meaning.
 * The rail is sticky so the actions stay reachable at the bottom of a long
 * record, and on a narrow screen it stacks underneath instead.
 */

export function Form({ children, ...props }: ComponentProps<typeof BaseForm>) {
	return (
		<BaseForm
			className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10"
			{...props}
		>
			{children}
		</BaseForm>
	);
}

export function FormFields({
	disabled,
	children,
}: {
	disabled?: boolean;
	children: ReactNode;
}) {
	return (
		<fieldset
			disabled={disabled}
			className="grid w-full min-w-0 flex-1 content-start gap-6 rounded-panel border border-line-subtle bg-layer-1 p-5 md:p-6"
		>
			{children}
		</fieldset>
	);
}

export function FormActions({ children }: { children: ReactNode }) {
	return (
		<aside className="editor-actions grid w-full gap-3 p-4 max-lg:sticky max-lg:bottom-0 max-lg:z-20 lg:sticky lg:top-20 lg:w-72 lg:p-5">
			{children}
		</aside>
	);
}
