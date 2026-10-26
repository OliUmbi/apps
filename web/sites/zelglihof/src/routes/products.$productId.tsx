import { idSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { NewsletterSignup } from "../components/newsletter-signup";
import { ProductIntroduction } from "../components/product-introduction";
import { ProductReservation } from "../components/product-reservation";
import { ProductVariants } from "../components/product-variants";
import { getProduct } from "../data/products";
import { absoluteUrl } from "../model/links";

export const Route = createFileRoute("/products/$productId")({
	loader: async ({ params }) => {
		// A malformed id is a missing page (branded 404), never an error page:
		// it is rejected here before the server function's validator runs.
		const id = idSchema.safeParse(params.productId);
		if (!id.success) throw notFound();
		const record = await getProduct({ data: { id: id.data } });
		if (!record) throw notFound();
		return record;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [] };
		return {
			meta: [
				{ title: `${loaderData.name} · ${m.zelglihof_page_title_suffix()}` },
				{ name: "description", content: loaderData.description },
				{ property: "og:title", content: loaderData.name },
				{ property: "og:description", content: loaderData.description },
				...(loaderData.image
					? [{ property: "og:image", content: absoluteUrl(loaderData.image) }]
					: []),
			],
		};
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
