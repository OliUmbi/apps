import type { Page as PageData } from "@oliumbi/contracts";
import type { Product } from "@oliumbi/zelglihof-data/content.types";
import { createFileRoute } from "@tanstack/react-router";
import { PaginatedList } from "../../components/ui/paginated-list";
import { getProductPage } from "../../content/catalog.functions";
import { ShopPage } from "../../pages/shop-page";
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
			{(items) => <ShopPage products={items} />}
		</PaginatedList>
	);
}
