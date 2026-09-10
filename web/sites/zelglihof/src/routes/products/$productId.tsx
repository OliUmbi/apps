import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProduct } from "../../content/catalog.functions";
import { ProductPage } from "../../pages/product-page";
export const Route = createFileRoute("/products/$productId")({
	loader: async ({ params }) => {
		const record = await getProduct({ data: { id: params.productId } });
		if (!record) throw notFound();
		return record;
	},
	component: Page,
});
function Page() {
	return <ProductPage product={Route.useLoaderData()} />;
}
