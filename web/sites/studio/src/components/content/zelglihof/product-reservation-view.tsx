import { m } from "@oliumbi/i18n/messages";
import {
	newProductReservationInput,
	type ProductReservation,
	type ProductReservationInput,
	productReservationInputFromRecord,
	productReservationInputSchema,
} from "@oliumbi/zelglihof-data/content/product-reservation";
import {
	deleteProductReservation,
	getProductReservation,
	listProductReservations,
	updateProductReservation,
} from "../../../server/content/zelglihof/product-reservation.functions";
import { RecordField, RecordFields } from "../../ui/record-fields";
import type { EditorFieldsProps } from "../content-form";
import { displayStatus } from "../display";
import { StatusField } from "../editor-controls";
import { InlineCollectionView } from "../inline-collection-view";
import { RoutedCollectionView } from "../routed-collection-view";

export function ProductReservationsView({
	productId,
}: {
	productId?: string;
} = {}) {
	const ReservationCollection = productId
		? InlineCollectionView
		: RoutedCollectionView;
	return (
		<ReservationCollection<ProductReservation, ProductReservationInput>
			collection="zelglihof.product_reservation"
			title="Reservationen"
			scope={productId}
			rowKey={(record) => record.id}
			loadPage={(input) =>
				listProductReservations({ data: { ...input, productId } })
			}
			loadRecord={(id) => getProductReservation({ data: { id } })}
			remove={(record) => deleteProductReservation({ data: { id: record.id } })}
			update={(record, values) =>
				updateProductReservation({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: productReservationInputSchema,
				initialValues: newProductReservationInput,
				valuesFromRecord: productReservationInputFromRecord,
				renderFields: (props) => <ProductReservationFields {...props} />,
			}}
			columns={[
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
			]}
			renderActions={(record) => (
				<RecordFields>
					<RecordField label={m.product()}>
						{record.productId ?? "—"}
					</RecordField>
					<RecordField label={m.product_variant()}>
						{record.productVariantId ?? "—"}
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
			)}
		/>
	);
}

function ProductReservationFields({
	values,
	onChange,
}: EditorFieldsProps<ProductReservationInput>) {
	return (
		<StatusField
			value={values.status}
			onChange={(value) => onChange("status", value)}
		/>
	);
}
