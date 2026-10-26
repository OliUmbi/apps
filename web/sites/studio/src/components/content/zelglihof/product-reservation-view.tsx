import { m } from "@oliumbi/i18n/messages";
import {
	newProductReservationInput,
	type ProductReservation,
	type ProductReservationInput,
	productReservationInputFromRecord,
	productReservationInputSchema,
} from "@oliumbi/zelglihof-data/content/product-reservation";
import { reservationStatusValues } from "@oliumbi/zelglihof-data/statuses";
import {
	deleteProductReservation,
	getProductReservation,
	listProductReservations,
	updateProductReservation,
} from "../../../server/content/zelglihof/product-reservation.functions";
import { RecordField, RecordFields } from "../../ui/record-fields";
import type { CollectionProps } from "../collection";
import type { EditorFieldsProps } from "../content-form";
import { displayStatus } from "../display";
import { StatusField } from "../editor-controls";
import { PageCollection } from "../page-collection";
import { RelatedCollection } from "../related-collection";

// Reservations are created by customers, so the collection is editable but
// not creatable. The unscoped list is the routed section; the scoped list is
// the related panel inside a product detail page.
function productReservationCollection(
	productId?: string,
): CollectionProps<ProductReservation, ProductReservationInput> {
	return {
		collection: "zelglihof.product_reservation",
		scope: productId,
		title: "Reservationen",
		rowKey: (record) => record.id,
		loadPage: (input) =>
			listProductReservations({ data: { ...input, productId } }),
		loadRecord: (id) => getProductReservation({ data: { id } }),
		remove: (record) => deleteProductReservation({ data: { id: record.id } }),
		capability: {
			mode: "editable",
			editor: {
				schema: productReservationInputSchema,
				initialValues: newProductReservationInput,
				valuesFromRecord: productReservationInputFromRecord,
				renderFields: (props) => <ProductReservationFields {...props} />,
			},
			update: (record, values) =>
				updateProductReservation({
					data: { key: { id: record.id }, values, updatedAt: record.updatedAt },
				}),
		},
		columns: [
			{
				id: "name",
				heading: m.name(),
				render: (record) => record.name,
			},
			{
				id: "productName",
				heading: m.studio_field_product_name(),
				render: (record) => record.productName,
			},
			{
				id: "variantName",
				heading: m.studio_field_variant_name(),
				render: (record) => record.variantName,
			},
			{
				id: "quantity",
				heading: m.quantity(),
				render: (record) => record.quantity,
			},
			{
				id: "status",
				heading: m.status(),
				render: (record) => displayStatus(record.status),
			},
		],
		renderActions: (record) => (
			<RecordFields>
				<RecordField label={m.product()}>
					{record.productId ?? "gelöscht"}
				</RecordField>
				<RecordField label={m.product_variant()}>
					{record.productVariantId ?? "gelöscht"}
				</RecordField>
				<RecordField label={m.studio_field_product_name()}>
					{record.productName}
				</RecordField>
				<RecordField label={m.studio_field_variant_name()}>
					{record.variantName}
				</RecordField>
				<RecordField label={m.studio_field_variant_description()}>
					{record.variantDescription ?? "—"}
				</RecordField>
				<RecordField label={m.studio_field_variant_quantity()}>
					{record.variantQuantity ?? "—"}
				</RecordField>
				<RecordField label={m.studio_field_variant_price()}>
					{record.variantPrice}
				</RecordField>
				<RecordField label={m.name()}>{record.name}</RecordField>
				<RecordField label={m.phone()}>{record.phone}</RecordField>
				<RecordField label={m.email()}>{record.email ?? "—"}</RecordField>
				<RecordField label={m.quantity()}>{record.quantity}</RecordField>
				<RecordField label={m.studio_field_note()}>
					{record.note ?? "—"}
				</RecordField>
			</RecordFields>
		),
	};
}

export function ProductReservationsView() {
	return (
		<PageCollection<ProductReservation, ProductReservationInput>
			{...productReservationCollection()}
		/>
	);
}

export function ProductReservationsRelated({
	productId,
}: {
	productId: string;
}) {
	return (
		<RelatedCollection<ProductReservation, ProductReservationInput>
			{...productReservationCollection(productId)}
		/>
	);
}

function ProductReservationFields({
	values,
	onChange,
}: EditorFieldsProps<ProductReservationInput>) {
	return (
		<StatusField
			statuses={reservationStatusValues}
			value={values.status}
			onChange={(value) => onChange("status", value)}
		/>
	);
}
