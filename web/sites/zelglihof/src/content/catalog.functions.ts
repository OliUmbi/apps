import { idSchema, pageSchema, slugSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	articleDetail,
	articlePage,
	productDetail,
	productPage,
} from "./catalog.server";

const pageInput = z.object({ page: pageSchema.shape.page });
export const getProductPage = createServerFn({ method: "GET" })
	.validator(pageInput)
	.handler(({ data }) => productPage(data.page));
export const getArticlePage = createServerFn({ method: "GET" })
	.validator(pageInput)
	.handler(({ data }) => articlePage(data.page));
export const getProduct = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(({ data }) => productDetail(data.id));
export const getArticle = createServerFn({ method: "GET" })
	.validator(z.object({ slug: slugSchema }))
	.handler(({ data }) => articleDetail(data.slug));
