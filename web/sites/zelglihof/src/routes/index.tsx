import { createFileRoute } from "@tanstack/react-router";
import { FarmIntroduction } from "../components/home/farm-introduction";
import { FarmShop } from "../components/home/farm-shop";
import { Hero } from "../components/home/hero";
import { LatestUpdates } from "../components/home/latest-updates";
import { NewsletterSignup } from "../components/newsletter-signup";
import { Promotions } from "../components/promotions";
import { getProductPage } from "../data/products";
import { getUpdatePage } from "../data/updates";

export const Route = createFileRoute("/")({
	loader: async () => {
		const [products, updates] = await Promise.all([
			getProductPage({ data: { page: 0 } }),
			getUpdatePage({ data: { page: 0 } }),
		]);
		return { products: products.items, updates: updates.items };
	},
	component: HomePage,
});

function HomePage() {
	const { products, updates } = Route.useLoaderData();
	return (
		<>
			<Promotions />
			<Hero featuredProduct={products[0]} />

			<LatestUpdates updates={updates} />

			<FarmShop products={products} />

			<FarmIntroduction />

			<NewsletterSignup />
		</>
	);
}
