import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductDetails } from "../components/product-details";
import { getProduct } from "../data/products";
export const Route = createFileRoute("/products/$productId")({
	loader: async ({ params }) => {
		const record = await getProduct({ data: { id: params.productId } });
		if (!record) throw notFound();
		return record;
	},
	component: Page,
});
function Page() {
	return <ProductDetails product={Route.useLoaderData()} />;
}
