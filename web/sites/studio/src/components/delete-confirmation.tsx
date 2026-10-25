import { m } from "@oliumbi/i18n/messages";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/dialog";

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
		<ConfirmDialog
			open
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
			title={m.confirm_delete()}
			description={m.confirm_delete_description()}
			feedback={<Alert tone="error">{error ? m.error_generic() : null}</Alert>}
			actions={
				<>
					<Button onClick={onClose} disabled={pending}>
						{m.cancel()}
					</Button>
					<Button variant="danger" onClick={onConfirm} disabled={pending}>
						{pending ? m.loading() : m.delete_record()}
					</Button>
				</>
			}
		/>
	);
}
