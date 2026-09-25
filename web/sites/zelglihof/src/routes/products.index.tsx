import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { NewsletterSignup } from "../components/newsletter-signup";
import { ProductCatalog } from "../components/product-catalog";
import { ProductNotifications } from "../components/product-notifications";
import { ShopEmptyState } from "../components/shop-empty-state";
import { ShopIntroduction } from "../components/shop-introduction";
import { getProductPage } from "../data/products";

export const Route = createFileRoute("/products/")({
	loader: () => getProductPage({ data: { page: 0 } }),
	component: ProductsPage,
});
function ProductsPage() {
	const initialPage = Route.useLoaderData();
	return (
		<>
			<ShopIntroduction />
			<PaginatedList
				queryKey={["products"]}
				initialPage={initialPage}
				load={(page) => getProductPage({ data: { page } })}
				emptyState={
					<section className="shell pb-24">
						<ShopEmptyState />
					</section>
				}
			>
				{(products) => <ProductCatalog products={products} />}
			</PaginatedList>
			<ProductNotifications />
			<NewsletterSignup />
		</>
	);
}
