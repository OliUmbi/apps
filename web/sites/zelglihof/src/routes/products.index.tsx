import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { ProductCatalog } from "../components/product-catalog";
import { getProductPage } from "../data/products";
import type { Product } from "../model/content";

export const Route = createFileRoute("/products/")({
	loader: () => getProductPage({ data: { page: 0 } }),
	component: Page,
});
function Page() {
	return (
		<PaginatedList<Product>
			queryKey={["products"]}
			initialPage={Route.useLoaderData()}
			load={(page) => getProductPage({ data: { page } })}
		>
			{(items) => <ProductCatalog products={items} />}
		</PaginatedList>
	);
}
