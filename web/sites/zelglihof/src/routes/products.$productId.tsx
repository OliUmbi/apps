import { createFileRoute, notFound } from "@tanstack/react-router";
import { NewsletterSignup } from "../components/newsletter-signup";
import { ProductIntroduction } from "../components/product-introduction";
import { ProductReservation } from "../components/product-reservation";
import { ProductVariants } from "../components/product-variants";
import { getProduct } from "../data/products";

export const Route = createFileRoute("/products/$productId")({
	loader: async ({ params }) => {
		const record = await getProduct({ data: { id: params.productId } });
		if (!record) throw notFound();
		return record;
	},
	component: ProductPage,
});
function ProductPage() {
	const product = Route.useLoaderData();
	return (
		<>
			<ProductIntroduction product={product} />
			<ProductVariants product={product} />
			<ProductReservation product={product} />
			{!product.reservationOpen && <NewsletterSignup />}
		</>
	);
}
