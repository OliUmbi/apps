import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ReactNode } from "react";

/*
 * Modal confirmation. The alert keeps its height so a failure message does not
 * push the actions down between two clicks.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	feedback,
	actions,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: ReactNode;
	feedback?: ReactNode;
	actions: ReactNode;
}) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-40 bg-canvas/80" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-layer-2 p-6 shadow-overlay">
					<AlertDialog.Title className="text-lg font-semibold tracking-tight text-fg">
						{title}
					</AlertDialog.Title>
					{description ? (
						<AlertDialog.Description className="mt-2 text-sm leading-relaxed text-fg-muted">
							{description}
						</AlertDialog.Description>
					) : null}
					{feedback}
					<div className="mt-6 flex justify-end gap-2">{actions}</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
