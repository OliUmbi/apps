import { createFileRoute } from "@tanstack/react-router";
import { findProduct } from "../../content/site-content";
import { ProductPage } from "../../pages/product-page";
export const Route = createFileRoute("/hofladen/$productId")({
	head: ({ params }) => {
		const product = findProduct(params.productId);
		return {
			meta: [
				{ title: `${product?.name ?? "Hofladen"} · Zelglihof` },
				...(product
					? [{ name: "description", content: product.description }]
					: []),
			],
		};
	},
	component: RouteComponent,
});
function RouteComponent() {
	const { productId } = Route.useParams();
	return <ProductPage productId={productId} />;
}
