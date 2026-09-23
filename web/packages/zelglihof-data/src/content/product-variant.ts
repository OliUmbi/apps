import { idSchema } from "@oliumbi/contracts";
import {
	optionalBodySchema,
	titleSchema,
} from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { productVariant } from "../schema";

export const productVariantKeySchema = z.strictObject({
	id: idSchema,
});
export type ProductVariantKey = z.infer<typeof productVariantKeySchema>;

export type ProductVariant = typeof productVariant.$inferSelect;

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
