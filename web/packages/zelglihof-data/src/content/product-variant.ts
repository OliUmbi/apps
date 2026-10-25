import { idSchema, optionalBodySchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const productVariantKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductVariantKey = z.infer<typeof productVariantKeySchema>;

// The managed product variant record as it crosses the package boundary.
// Written out on purpose: a renamed storage column must not silently change
// this shape. Price is display-only text (plan decision D5).
export interface ProductVariant {
	id: string;
	productId: string;
	name: string;
	description: string | null;
	imageId: string | null;
	price: string;
	quantity: number | null;
	createdAt: string;
	updatedAt: string;
}

export const productVariantInputSchema = z.strictObject({
	productId: idSchema,
	name: titleSchema,
	description: optionalBodySchema,
	imageId: idSchema.nullable(),
	price: titleSchema,
	quantity: z.number().int().nonnegative().nullable(),
});
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;

export function newProductVariantInput(productId: string): ProductVariantInput {
	return {
		productId: productId,
		name: "",
		description: null,
		imageId: null,
		price: "",
		quantity: null,
	};
}

export function productVariantInputFromRecord(
	record: ProductVariant,
): ProductVariantInput {
	return {
		productId: record.productId,
		name: record.name,
		description: record.description,
		imageId: record.imageId,
		price: record.price,
		quantity: record.quantity,
	};
}
