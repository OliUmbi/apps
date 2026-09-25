import type { ComponentType } from "react";
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

const contentViews = {
	"jublawoma.promotion": JublawomaPromotionsView,
	"jublawoma.story": JublawomaStoriesView,
	"jublawoma.event": JublawomaEventsView,
	"jublawoma.member": JublawomaMembersView,
	"jublawoma.donation": JublawomaDonationsView,
	"unclet.showcase": UncletShowcasesView,
	"unclet.review": UncletReviewsView,
	"unclet.inquiry": UncletInquiriesView,
	"zelglihof.promotion": ZelglihofPromotionsView,
	"zelglihof.article": ZelglihofArticlesView,
	"zelglihof.product": ZelglihofProductsView,
	"zelglihof.product_reservation": ZelglihofProductReservationsView,
	"zelglihof.subscriber": ZelglihofSubscribersView,
	"zelglihof.campaign": ZelglihofCampaignsView,
	"zelglihof.inquiry": ZelglihofInquiriesView,
} satisfies Record<ContentSection, ComponentType>;

export function ContentView({ section }: { section: ContentSection }) {
	const View = contentViews[section];
	return <View />;
}
