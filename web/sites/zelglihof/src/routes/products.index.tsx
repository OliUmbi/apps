import type { Page as PageData } from "@oliumbi/contracts";
import type { Product } from "@oliumbi/zelglihof-data/public.types";
import { createFileRoute } from "@tanstack/react-router";
import { PaginatedList } from "../components/paginated-list";
import { ProductCatalog } from "../components/product-catalog";
import { getProductPage } from "../data/products";
export const Route = createFileRoute("/products/")({
	loader: () =>
		getProductPage({ data: { page: 0 } }) as Promise<PageData<Product>>,
	component: Page,
});
function Page() {
	return (
		<PaginatedList<Product>
			queryKey={["products"]}
			initialPage={Route.useLoaderData()}
			load={(page) =>
				getProductPage({ data: { page } }) as Promise<PageData<Product>>
			}
		>
			{(items) => <ProductCatalog products={items} />}
		</PaginatedList>
	);
}
