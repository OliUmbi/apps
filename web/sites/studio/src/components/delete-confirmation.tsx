import { m } from "@oliumbi/i18n/messages";
import { AlertDialog, Button, FormFeedback } from "./ui/index";
export function DeleteConfirmation({
	pending,
	error,
	onConfirm,
	onClose,
}: {
	pending: boolean;
	error: boolean;
	onConfirm: () => void;
	onClose: () => void;
}) {
	return (
		<AlertDialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
		>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-60 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-zinc-900 p-6 text-white">
					<AlertDialog.Title className="text-xl">
						{m.confirm_delete()}
					</AlertDialog.Title>
					<AlertDialog.Description className="my-4 text-zinc-400">
						{m.confirm_delete_description()}
					</AlertDialog.Description>
					<FormFeedback error={error ? m.error_generic() : null} />
					<div className="mt-6 flex justify-end gap-3">
						<Button className="button" onClick={onClose} disabled={pending}>
							{m.cancel()}
						</Button>
						<Button
							className="button danger"
							onClick={onConfirm}
							disabled={pending}
						>
							{pending ? m.loading() : m.delete_record()}
						</Button>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
