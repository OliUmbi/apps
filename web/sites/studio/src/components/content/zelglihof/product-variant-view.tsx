import { m } from "@oliumbi/i18n/messages";
import {
	newProductVariantInput,
	type ProductVariant,
	type ProductVariantInput,
	productVariantInputFromRecord,
	productVariantInputSchema,
} from "@oliumbi/zelglihof-data/content/product-variant";
import {
	createProductVariant,
	deleteProductVariant,
	getProductVariant,
	listProductVariants,
	updateProductVariant,
} from "../../../server/content/zelglihof/product-variant.functions";
import { TextField } from "../../ui/text-field";
import type { CollectionProps } from "../collection";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { NumberField } from "../editor-controls";
import { ImageField } from "../image-field";
import { RelatedCollection } from "../related-collection";

// The variants of one product, scoped to it: a related panel inside the
// product detail page.
function productVariantCollection(
	productId: string,
): CollectionProps<ProductVariant, ProductVariantInput> {
	return {
		collection: "zelglihof.product_variant",
		scope: productId,
		title: "Varianten",
		rowKey: (record) => record.id,
		loadPage: (input) => listProductVariants({ data: { ...input, productId } }),
		loadRecord: (id) => getProductVariant({ data: { id } }),
		remove: (record) => deleteProductVariant({ data: { id: record.id } }),
		capability: {
			mode: "creatable",
			editor: {
				schema: productVariantInputSchema,
				initialValues: () => newProductVariantInput(productId),
				valuesFromRecord: productVariantInputFromRecord,
				renderFields: (props) => <ProductVariantFields {...props} />,
			},
			create: (values) => createProductVariant({ data: values }),
			update: (record, values) =>
				updateProductVariant({
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
				id: "imageId",
				heading: m.image(),
				render: (record) => (
					<ImageThumbnail site="zelglihof" id={record.imageId} />
				),
			},
			{
				id: "price",
				heading: m.price(),
				render: (record) => record.price,
			},
			{
				id: "quantity",
				heading: m.quantity(),
				render: (record) => record.quantity,
			},
		],
	};
}

export function ProductVariantsRelated({ productId }: { productId: string }) {
	return <RelatedCollection {...productVariantCollection(productId)} />;
}

function ProductVariantFields({
	values,
	onChange,
}: EditorFieldsProps<ProductVariantInput>) {
	return (
		<>
			<TextField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<TextField
				name="description"
				label={m.description()}
				value={values.description ?? ""}
				render={<textarea rows={4} />}
				onChange={(event) =>
					onChange("description", event.target.value || null)
				}
			/>
			<ImageField
				site="zelglihof"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<TextField
				name="price"
				label={m.price()}
				value={values.price}
				required
				onChange={(event) => onChange("price", event.target.value)}
			/>
			<NumberField
				name="quantity"
				label={m.quantity()}
				value={values.quantity}
				min={0}
				step={1}
				nullable
				onChange={(value) => onChange("quantity", value)}
			/>
		</>
	);
}
