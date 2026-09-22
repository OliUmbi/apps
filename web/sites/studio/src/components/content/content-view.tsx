import type { ContentSection } from "../../model/content-sections";
import { DonationsView as JublawomaDonationsView } from "./jublawoma/donation-view";
import { EventsView as JublawomaEventsView } from "./jublawoma/event-view";
import { MembersView as JublawomaMembersView } from "./jublawoma/member-view";
import { PromotionsView as JublawomaPromotionsView } from "./jublawoma/promotion-view";
import { StoriesView as JublawomaStoriesView } from "./jublawoma/story-view";
import { InquiriesView as UncletInquiriesView } from "./unclet/inquiry-view";
import { ReviewsView as UncletReviewsView } from "./unclet/review-view";
import { ShowcasesView as UncletShowcasesView } from "./unclet/showcase-view";
import { ArticlesView as ZelglihofArticlesView } from "./zelglihof/article-view";
import { CampaignsView as ZelglihofCampaignsView } from "./zelglihof/campaign-view";
import { InquiriesView as ZelglihofInquiriesView } from "./zelglihof/inquiry-view";
import { ProductReservationsView as ZelglihofProductReservationsView } from "./zelglihof/product-reservation-view";
import { ProductsView as ZelglihofProductsView } from "./zelglihof/product-view";
import { PromotionsView as ZelglihofPromotionsView } from "./zelglihof/promotion-view";
import { SubscribersView as ZelglihofSubscribersView } from "./zelglihof/subscriber-view";

export function ContentView({ section }: { section: ContentSection }) {
	switch (section) {
		case "jublawoma.promotion":
			return <JublawomaPromotionsView />;
		case "jublawoma.story":
			return <JublawomaStoriesView />;
		case "jublawoma.event":
			return <JublawomaEventsView />;
		case "jublawoma.member":
			return <JublawomaMembersView />;
		case "jublawoma.donation":
			return <JublawomaDonationsView />;
		case "unclet.showcase":
			return <UncletShowcasesView />;
		case "unclet.review":
			return <UncletReviewsView />;
		case "unclet.inquiry":
			return <UncletInquiriesView />;
		case "zelglihof.promotion":
			return <ZelglihofPromotionsView />;
		case "zelglihof.article":
			return <ZelglihofArticlesView />;
		case "zelglihof.product":
			return <ZelglihofProductsView />;
		case "zelglihof.product_reservation":
			return <ZelglihofProductReservationsView />;
		case "zelglihof.subscriber":
			return <ZelglihofSubscribersView />;
		case "zelglihof.campaign":
			return <ZelglihofCampaignsView />;
		case "zelglihof.inquiry":
			return <ZelglihofInquiriesView />;
	}
}
