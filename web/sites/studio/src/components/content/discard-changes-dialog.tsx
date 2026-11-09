import { m } from "@oliumbi/i18n/messages";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/dialog";

export function DiscardChangesDialog({
	open,
	onCancel,
	onDiscard,
}: {
	open: boolean;
	onCancel: () => void;
	onDiscard: () => void;
}) {
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onCancel();
			}}
			title={m.studio_unsaved_changes_title()}
			description={m.studio_unsaved_changes_description()}
			actions={
				<>
					<Button onClick={onCancel}>{m.cancel()}</Button>
					<Button variant="danger" onClick={onDiscard}>
						{m.studio_discard_changes()}
					</Button>
				</>
			}
		/>
	);
}
