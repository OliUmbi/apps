import { idSchema } from "@oliumbi/contracts";
import {
	auditColumns,
	optionalBodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";

export const productVariantKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductVariantKey = z.infer<typeof productVariantKeySchema>;

export const productVariantSchema = z.object({
	id: idSchema,
	productId: idSchema,
	name: z.string(),
	description: z.string().nullable(),
	imageId: idSchema.nullable(),
	price: z.string(),
	quantity: z.number().int().nonnegative().nullable(),
	...auditColumns,
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

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
