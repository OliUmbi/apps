import { m } from "@oliumbi/i18n/messages";
import type { ProductReservation } from "@oliumbi/zelglihof-data/content/product-reservation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cancelProductReservation } from "../../../server/content/zelglihof/product-reservation.functions";
import { Alert } from "../../ui/alert";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../ui/dialog";

// Cancellation is an explicit, irreversible transition: it is the only action
// that may release reserved stock, and the service performs it exactly once.
export function ReservationCancel({
	reservation,
}: {
	reservation: ProductReservation;
}) {
	const [open, setOpen] = useState(false);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: () =>
			cancelProductReservation({
				data: {
					key: { id: reservation.id },
					reason: null,
					updatedAt: reservation.updatedAt,
				},
			}),
		onSuccess: async () => {
			await cache.invalidateQueries({
				queryKey: ["content", "zelglihof.product_reservation"],
			});
			setOpen(false);
		},
	});

	if (reservation.status !== "new" && reservation.status !== "in-progress")
		return null;

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
				{m.studio_reservation_cancel()}
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (mutation.isPending) return;
					if (nextOpen) mutation.reset();
					setOpen(nextOpen);
				}}
				title={m.studio_reservation_cancel_confirmation_title()}
				description={m.studio_reservation_cancel_confirmation_description()}
				feedback={
					<Alert tone="error">
						{mutation.isError ? m.studio_reservation_cancel_error() : null}
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
							{mutation.isPending ? m.loading() : m.studio_reservation_cancel()}
						</Button>
					</>
				}
			/>
		</>
	);
}
