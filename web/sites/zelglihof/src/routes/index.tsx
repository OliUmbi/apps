import { createFileRoute } from "@tanstack/react-router";
import { FarmIntroduction } from "../components/home/farm-introduction";
import { FarmShop } from "../components/home/farm-shop";
import { Hero } from "../components/home/hero";
import { LatestUpdates } from "../components/home/latest-updates";
import { NewsletterSignup } from "../components/newsletter-signup";
import { Promotions } from "../components/promotions";
import { getProductPage } from "../data/products";
import { getPromotions } from "../data/promotions";
import { getUpdatePage } from "../data/updates";

// Bounded home queries: the page shows one hero product, a short shop strip
// and a short updates strip - never a full page of either.
const homeProductCount = 4;
const homeUpdateCount = 3;

export const Route = createFileRoute("/")({
	loader: async () => {
		const [products, updates, promotions] = await Promise.all([
			getProductPage({ data: { page: 0, size: homeProductCount } }),
			getUpdatePage({ data: { page: 0, size: homeUpdateCount } }),
			getPromotions(),
		]);
		return {
			products: products.items,
			updates: updates.items,
			promotions,
		};
	},
	component: HomePage,
});

function HomePage() {
	const { products, updates, promotions } = Route.useLoaderData();
	return (
		<>
			<Promotions initialPromotions={promotions} />
			<Hero featuredProduct={products[0]} />

			<LatestUpdates updates={updates} />

			<FarmShop products={products} />

			<FarmIntroduction />

			<NewsletterSignup />
		</>
	);
}
