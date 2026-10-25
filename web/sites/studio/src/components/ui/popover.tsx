import { Popover } from "@base-ui/react/popover";
import type { ComponentProps, ReactNode } from "react";
import { controlClass } from "./field";

/*
 * Anchored panel. The trigger reuses the text control shape so a date field is
 * the same height as a text field next to it.
 */

export function PopoverRoot({
	children,
	...props
}: ComponentProps<typeof Popover.Root>) {
	return <Popover.Root {...props}>{children}</Popover.Root>;
}

export function PopoverTrigger({
	children,
	...props
}: ComponentProps<typeof Popover.Trigger>) {
	return (
		<Popover.Trigger
			className={`${controlClass} flex items-center gap-2 text-left data-popup-open:border-interactive`}
			{...props}
		>
			{children}
		</Popover.Trigger>
	);
}

export function PopoverPanel({ children }: { children: ReactNode }) {
	return (
		<Popover.Portal>
			<Popover.Positioner className="z-50" sideOffset={8}>
				<Popover.Popup className="rounded-control border border-line bg-layer-3 p-1 shadow-overlay">
					{children}
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	);
}
