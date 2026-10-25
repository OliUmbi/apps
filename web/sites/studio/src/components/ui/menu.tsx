import { Menu } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";

/*
 * The only dropdown. The trigger is a full-width slot so the sidebar row keeps
 * its height whether or not the menu is open.
 */

export function MenuRoot({ children }: { children: ReactNode }) {
	return <Menu.Root>{children}</Menu.Root>;
}

export function MenuTrigger({
	children,
	...props
}: ComponentProps<typeof Menu.Trigger>) {
	return (
		<Menu.Trigger
			className="flex w-full items-center gap-2 rounded-control border border-transparent px-2 py-2 text-left transition-colors hover:border-line hover:bg-layer-2"
			{...props}
		>
			{children}
		</Menu.Trigger>
	);
}

export function MenuPanel({ children }: { children: ReactNode }) {
	return (
		<Menu.Portal>
			<Menu.Positioner className="z-50" sideOffset={6}>
				<Menu.Popup className="w-60 rounded-control border border-line bg-layer-3 p-1 text-fg shadow-overlay">
					{children}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	);
}

export function MenuItem({
	children,
	...props
}: ComponentProps<typeof Menu.Item>) {
	return (
		<Menu.Item
			className="flex h-9 cursor-pointer items-center gap-2 rounded-control px-2 text-sm text-fg data-highlighted:bg-layer-2 data-highlighted:outline-none"
			{...props}
		>
			{children}
		</Menu.Item>
	);
}
