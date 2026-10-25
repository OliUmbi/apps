import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "./button";

/*
 * Off-canvas panel for small screens. Same surface as the sidebar so the
 * navigation reads as one object whichever way it is shown.
 */

export function Drawer({
	open,
	onOpenChange,
	title,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-40 bg-canvas/80" />
				<Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-line bg-layer-1">
					<Dialog.Title className="sr-only">{title}</Dialog.Title>
					{children}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export function DrawerClose({ label }: { label: string }) {
	return (
		<Dialog.Close
			render={
				<IconButton label={label}>
					{<X size={17} aria-hidden="true" />}
				</IconButton>
			}
		/>
	);
}
