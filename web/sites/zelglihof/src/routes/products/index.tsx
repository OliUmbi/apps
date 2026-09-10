import { createFileRoute } from "@tanstack/react-router";
import { PaginatedList } from "../../components/ui/paginated-list";
import { getProductPage } from "../../content/catalog.functions";
import { ShopPage } from "../../pages/shop-page";
export const Route = createFileRoute("/products/")({
	loader: () => getProductPage({ data: { page: 0 } }),
	component: Page,
});
function Page() {
	return (
		<PaginatedList
			queryKey={["products"]}
			initialPage={Route.useLoaderData()}
			load={(page) => getProductPage({ data: { page } })}
		>
			{(items) => <ShopPage products={items} />}
		</PaginatedList>
	);
}
