import { m } from "@oliumbi/i18n/messages";
import {
	newProductInput,
	type Product,
	type ProductInput,
	productInputFromRecord,
	productInputSchema,
} from "@oliumbi/zelglihof-data/content/product";
import { formatTimestamp } from "../../../model/dates";
import {
	createProduct,
	deleteProduct,
	getProduct,
	listProducts,
	updateProduct,
} from "../../../server/content/zelglihof/product.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { CheckboxField } from "../editor-controls";
import { ImageField } from "../image-field";
import { RoutedCollectionView } from "../routed-collection-view";
import { ProductReservationsView } from "./product-reservation-view";
import { ProductVariantsView } from "./product-variant-view";

export function ProductsView() {
	return (
		<RoutedCollectionView<Product, ProductInput>
			collection="zelglihof.product"
			title="Produkte"
			rowKey={(record) => record.id}
			loadPage={(input) => listProducts({ data: input })}
			loadRecord={(id) => getProduct({ data: { id } })}
			remove={(record) => deleteProduct({ data: { id: record.id } })}
			create={(values) => createProduct({ data: values })}
			update={(record, values) =>
				updateProduct({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: productInputSchema,
				initialValues: newProductInput,
				valuesFromRecord: productInputFromRecord,
				renderFields: (props) => <ProductFields {...props} />,
			}}
			columns={[
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "imageId",
					heading: m.image(),
					render: (record) => (
						<ImageThumbnail site="zelglihof" id={record.imageId} />
					),
				},
				{
					id: "visible",
					heading: m.studio_field_visible(),
					render: (record) => (record.visible ? m.yes() : m.no()),
				},
				{
					id: "reservable",
					heading: m.studio_field_reservable(),
					render: (record) => (record.reservable ? m.yes() : m.no()),
				},
				{
					id: "startsAt",
					heading: m.studio_field_starts_at(),
					render: (record) => formatTimestamp(record.startsAt),
				},
			]}
			renderRelated={(record) => (
				<div className="related-grid">
					<ProductVariantsView
						key={`product_variant:${record.id}`}
						productId={record.id}
					/>
					<ProductReservationsView
						key={`product_reservation:${record.id}`}
						productId={record.id}
					/>
				</div>
			)}
		/>
	);
}

function ProductFields({ values, onChange }: EditorFieldsProps<ProductInput>) {
	return (
		<>
			<InputField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<InputField
				name="description"
				label={m.description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<InputField
				name="body"
				label={m.body()}
				value={values.body}
				required
				render={<textarea rows={18} />}
				onChange={(event) => onChange("body", event.target.value)}
			/>
			<ImageField
				site="zelglihof"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<CheckboxField
				name="visible"
				label={m.studio_field_visible()}
				value={values.visible}
				onChange={(value) => onChange("visible", value)}
			/>
			<CheckboxField
				name="reservable"
				label={m.studio_field_reservable()}
				value={values.reservable}
				onChange={(value) => onChange("reservable", value)}
			/>
			<DateField
				name="startsAt"
				label={m.studio_field_starts_at()}
				value={values.startsAt}
				includeTime
				nullable
				onChange={(value) => onChange("startsAt", value)}
			/>
			<DateField
				name="endsAt"
				label={m.studio_field_ends_at()}
				value={values.endsAt}
				includeTime
				nullable
				onChange={(value) => onChange("endsAt", value)}
			/>
		</>
	);
}
