import { Select } from "@base-ui/react/select";
import type { ComponentProps, ReactNode } from "react";
import { controlClass } from "./field";

/*
 * The only dropdown-with-selection. Its trigger reuses the text control shape
 * so an editable row looks the same whichever control fills it.
 *
 * `label` is the text the trigger shows when this item is chosen; `prefix` is
 * optional decoration such as a thumbnail.
 */

export function SelectRoot({
	children,
	...props
}: ComponentProps<typeof Select.Root>) {
	return <Select.Root {...props}>{children}</Select.Root>;
}

export function SelectTrigger({
	children,
	...props
}: ComponentProps<typeof Select.Trigger>) {
	return (
		<Select.Trigger
			className={`${controlClass} flex items-center gap-3 text-left data-popup-open:border-interactive`}
			{...props}
		>
			{children}
		</Select.Trigger>
	);
}

export function SelectValue(props: ComponentProps<typeof Select.Value>) {
	return <Select.Value {...props} />;
}

export function SelectPanel({ children }: { children: ReactNode }) {
	return (
		<Select.Portal>
			<Select.Positioner className="z-50" sideOffset={6}>
				<Select.Popup className="max-h-80 min-w-60 overflow-y-auto rounded-control border border-line bg-layer-3 p-1 text-fg shadow-overlay">
					{children}
				</Select.Popup>
			</Select.Positioner>
		</Select.Portal>
	);
}

type SelectItemProps = Omit<
	ComponentProps<typeof Select.Item>,
	"children" | "label" | "prefix"
>;

export function SelectItem({
	label,
	prefix,
	...props
}: SelectItemProps & {
	label: ReactNode;
	prefix?: ReactNode;
}) {
	return (
		<Select.Item
			className="flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 text-sm text-fg data-highlighted:bg-layer-2 data-highlighted:outline-none"
			{...props}
		>
			{prefix}
			<Select.ItemText>{label}</Select.ItemText>
		</Select.Item>
	);
}
