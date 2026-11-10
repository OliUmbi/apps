import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatTimestamp } from "../../model/dates";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/dialog";

// Archiving retires a managed record without deleting it: the row (and the
// history that references it) stays, while public reads hide it. Archiving is
// one-way in Studio, so it goes through an explicit confirmation.
export function ArchiveAction({
	collection,
	archivedAt,
	archivedBy,
	onArchive,
}: {
	collection: string;
	archivedAt: string | null;
	archivedBy: string | null;
	onArchive: () => Promise<unknown>;
}) {
	const [open, setOpen] = useState(false);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: onArchive,
		onSuccess: async () => {
			await cache.invalidateQueries({ queryKey: ["content", collection] });
			setOpen(false);
		},
	});

	if (archivedAt)
		return (
			<Alert tone="info">
				{m.studio_archived_at({
					archivedAt: formatTimestamp(archivedAt),
					archivedBy: archivedBy ?? "—",
				})}
			</Alert>
		);

	return (
		<>
			<Button
				variant="danger"
				disabled={mutation.isPending}
				onClick={() => {
					mutation.reset();
					setOpen(true);
				}}
			>
				{m.studio_archive()}
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (mutation.isPending) return;
					if (nextOpen) mutation.reset();
					setOpen(nextOpen);
				}}
				title={m.studio_archive_confirmation_title()}
				description={m.studio_archive_confirmation_description()}
				feedback={
					<Alert tone="error">
						{mutation.isError ? m.studio_archive_error() : null}
					</Alert>
				}
				actions={
					<>
						<Button
							onClick={() => setOpen(false)}
							disabled={mutation.isPending}
						>
							{m.cancel()}
						</Button>
						<Button
							variant="danger"
							onClick={() => mutation.mutate()}
							disabled={mutation.isPending}
						>
							{mutation.isPending ? m.loading() : m.studio_archive()}
						</Button>
					</>
				}
			/>
		</>
	);
}
