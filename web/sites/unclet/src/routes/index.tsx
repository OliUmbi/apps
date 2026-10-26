import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ChefIntroduction } from "../components/home/chef-introduction";
import { Hero } from "../components/home/hero";
import { InquiryInvitation } from "../components/home/inquiry-invitation";
import { ServiceFormats } from "../components/home/service-formats";
import { ShowcasePreview } from "../components/home/showcase-preview";
import { PublicReviews } from "../components/public-reviews";
import { getReviewPage } from "../data/reviews";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/")({
	head: () =>
		pageHead({
			title: m.unclet_site_title(),
			description: m.unclet_site_description(),
		}),
	loader: async () => ({
		// The loader seeds review page 0 so the reviews are in the SSR HTML; a
		// failure must not take the home page down, the section renders its own
		// error branch for the null seed.
		reviews: await getReviewPage({ data: { page: 0 } }).catch(() => null),
	}),
	component: HomePage,
});

function HomePage() {
	const { reviews } = Route.useLoaderData();
	return (
		<>
			<Hero />

			<ServiceFormats />

			<ChefIntroduction />

			<ShowcasePreview />

			<PublicReviews initialPage={reviews} />
			<InquiryInvitation />
		</>
	);
}
