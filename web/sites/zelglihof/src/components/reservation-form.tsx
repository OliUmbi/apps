import { m } from "@oliumbi/i18n/messages";
import { reservationSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { createReservation } from "../data/reservations";
import type { Product } from "../model/content";
import { SubmissionForm } from "./submission-form";

export function ReservationForm({ product }: { product: Product }) {
	const submit = useServerFn(createReservation);
	const availableVariants = product.variants.filter(
		(variant) => variant.quantity === null || variant.quantity > 0,
	);
	if (availableVariants.length === 0) return <p>{m.unavailable()}</p>;
	return (
		<SubmissionForm
			schema={reservationSchema}
			className="rounded-3xl bg-cream p-8"
			defaults={{ productId: product.id }}
			submit={(data) => submit({ data })}
			getResultError={(result) =>
				result.outcome === "unavailable" ? m.unavailable() : null
			}
			success={m.zelglihof_reservation_success()}
			fields={[
				{
					name: "variantId",
					label: m.selection(),
					required: true,
					options: availableVariants.map((variant) => ({
						value: variant.id,
						label: `${variant.name} · ${variant.price}`,
					})),
				},
				{
					name: "quantity",
					label: m.quantity(),
					type: "number",
					min: 1,
					required: true,
				},
				{
					name: "name",
					label: m.name(),
					required: true,
				},
				{
					name: "phone",
					label: m.phone(),
					type: "tel",
					required: true,
				},
				{
					name: "email",
					label: m.email(),
					type: "email",
				},
				{
					name: "note",
					label: m.note(),
					type: "textarea",
				},
			]}
		/>
	);
}
