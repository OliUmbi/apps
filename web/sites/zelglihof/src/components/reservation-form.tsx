import { m } from "@oliumbi/i18n/messages";
import { reservationSchema } from "@oliumbi/zelglihof-data/forms";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createReservation } from "../data/reservations";
import { stockLabel } from "../model/availability";
import type { Product } from "../model/content";
import { SubmissionForm, useSubmissionId } from "./submission-form";

const quantityBackstop = 100;

export function ReservationForm({ product }: { product: Product }) {
	const submit = useServerFn(createReservation);
	const submissionId = useSubmissionId();
	const reservableVariants = product.variants.filter(
		(variant) => variant.stock.state !== "sold-out",
	);
	const [variantId, setVariantId] = useState(reservableVariants[0]?.id ?? "");
	const selected =
		reservableVariants.find((variant) => variant.id === variantId) ??
		reservableVariants[0];
	if (!selected) return <p>{m.unavailable()}</p>;
	const remaining = selected.stock.remaining;
	return (
		<SubmissionForm
			schema={reservationSchema}
			className="rounded-3xl bg-cream p-8"
			defaults={{ productId: product.id, submissionId }}
			submit={(data) => submit({ data })}
			getResultError={(result) =>
				result.outcome === "unavailable" ? m.unavailable() : null
			}
			success={(result) =>
				result.outcome === "reserved" ? (
					<>
						{m.zelglihof_reservation_success()}{" "}
						<strong>
							{m.zelglihof_submission_reference({
								reference: result.reference,
							})}
						</strong>
					</>
				) : null
			}
			fields={[
				{
					name: "variantId",
					kind: "select",
					label: m.selection(),
					required: true,
					onChange: setVariantId,
					options: reservableVariants.map((variant) => ({
						value: variant.id,
						label: `${variant.name} · ${variant.price}`,
					})),
				},
				{
					name: "quantity",
					kind: "number",
					label: m.quantity(),
					min: 1,
					// The selected variant's remaining stock caps the input. The
					// schema cap stays as backstop and the server remains the source
					// of truth for what may still be reserved.
					max:
						remaining === null
							? quantityBackstop
							: Math.min(quantityBackstop, remaining),
					required: true,
					hint: stockLabel(selected.stock) ?? undefined,
				},
				{ name: "name", kind: "text", label: m.name(), required: true },
				{ name: "phone", kind: "tel", label: m.phone(), required: true },
				{ name: "email", kind: "email", label: m.email() },
				{ name: "note", kind: "textarea", label: m.note() },
			]}
		/>
	);
}
