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
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { DetailItem, displayStatus } from "../display";
import { StatusField } from "../editor-controls";

export function ProductReservationsView({
	productId,
}: {
	productId?: string;
} = {}) {
	return (
		<CollectionView<ProductReservation, ProductReservationInput>
			collection="zelglihof.product_reservation"
			title="Reservationen"
			scope={productId}
			inline={Boolean(productId)}
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
					heading: m.studio_field_name(),
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
					heading: m.studio_field_quantity(),
					render: (record) => record.quantity,
				},
				{
					id: "status",
					heading: m.studio_field_status(),
					render: (record) => displayStatus(record.status),
				},
			]}
			renderActions={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.studio_field_product_id()}>
						{record.productId}
					</DetailItem>
					<DetailItem label={m.studio_field_product_variant_id()}>
						{record.productVariantId}
					</DetailItem>
					<DetailItem label={m.studio_field_product_name()}>
						{record.productName}
					</DetailItem>
					<DetailItem label={m.studio_field_variant_name()}>
						{record.variantName}
					</DetailItem>
					<DetailItem label={m.studio_field_variant_description()}>
						{record.variantDescription}
					</DetailItem>
					<DetailItem label={m.studio_field_variant_quantity()}>
						{record.variantQuantity}
					</DetailItem>
					<DetailItem label={m.studio_field_variant_price()}>
						{record.variantPrice}
					</DetailItem>
					<DetailItem label={m.studio_field_name()}>{record.name}</DetailItem>
					<DetailItem label={m.studio_field_phone()}>{record.phone}</DetailItem>
					<DetailItem label={m.studio_field_email()}>{record.email}</DetailItem>
					<DetailItem label={m.studio_field_quantity()}>
						{record.quantity}
					</DetailItem>
					<DetailItem label={m.studio_field_note()}>{record.note}</DetailItem>
				</dl>
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
