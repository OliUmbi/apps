import { m } from "@oliumbi/i18n/messages";
import type { Product } from "@oliumbi/zelglihof-data/content.types";
import { reservationSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { createReservation } from "../shop/reservation.functions";
import { SubmissionForm } from "./ui/submission-form";
export function ReservationForm({ product }: { product: Product }) {
	const submit = useServerFn(createReservation);
	if (
		!product.variants.some(
			(variant) => variant.quantity === null || variant.quantity > 0,
		)
	)
		return <p>{m.unavailable()}</p>;
	return (
		<SubmissionForm
			schema={reservationSchema}
			className="rounded-3xl bg-cream p-8"
			defaults={{ productId: product.id }}
			submit={(data) => submit({ data })}
			success={m.zelglihof_components_reservation_form_success()}
			fields={[
				{
					name: "variantId",
					label: m.zelglihof_components_reservation_form_label(),
					required: true,
					options: product.variants
						.filter(
							(variant) => variant.quantity === null || variant.quantity > 0,
						)
						.map((variant) => ({
							value: variant.id,
							label: `${variant.name} · ${variant.price}`,
						})),
				},
				{
					name: "quantity",
					label: m.zelglihof_components_reservation_form_label_2(),
					type: "number",
					min: 1,
					required: true,
				},
				{
					name: "name",
					label: m.zelglihof_components_reservation_form_label_3(),
					required: true,
				},
				{
					name: "phone",
					label: m.zelglihof_components_reservation_form_label_4(),
					type: "tel",
					required: true,
				},
				{
					name: "email",
					label: m.zelglihof_components_reservation_form_label_5(),
					type: "email",
				},
				{
					name: "note",
					label: m.zelglihof_components_reservation_form_label_6(),
					type: "textarea",
				},
			]}
		/>
	);
}
