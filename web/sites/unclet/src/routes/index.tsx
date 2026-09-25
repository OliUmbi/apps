import { createFileRoute } from "@tanstack/react-router";
import { ChefIntroduction } from "../components/home/chef-introduction";
import { Hero } from "../components/home/hero";
import { InquiryInvitation } from "../components/home/inquiry-invitation";
import { ServiceFormats } from "../components/home/service-formats";
import { ShowcasePreview } from "../components/home/showcase-preview";
import { PublicReviews } from "../components/public-reviews";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	return (
		<>
			<Hero />

			<ServiceFormats />

			<ChefIntroduction />

			<ShowcasePreview />

			<PublicReviews />
			<InquiryInvitation />
		</>
	);
}
