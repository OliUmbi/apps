import { Button } from "@base-ui/react/button";
import type { Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { getReviewPage } from "../data/reviews";
import type { PublicReview } from "../model/content";
import { ReviewCard } from "./review-card";

export function PublicReviews({
	initialPage,
}: {
	// The route loader seeds page 0; null marks a failed load (the home page
	// renders its own error branch instead of going down with the list).
	initialPage: Page<PublicReview> | null;
}) {
	if (!initialPage)
		return (
			<section className="border-y border-bone/10 bg-coal py-24 md:py-32">
				<div className="shell">
					<p role="alert">{m.error_generic()}</p>
				</div>
			</section>
		);
	// No reviews at all: the whole section stays off the page.
	if (initialPage.items.length === 0 && initialPage.nextPage === null)
		return null;
	return (
		<section className="border-y border-bone/10 bg-coal py-24 md:py-32">
			<div className="shell">
				<div className="grid gap-6 md:grid-cols-[.75fr_1.25fr] md:items-end">
					<div>
						<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
							{m.unclet_reviews_eyebrow()}
						</p>
						<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-5xl md:text-7xl">
							{m.unclet_reviews_title()}
						</h2>
					</div>
					<p className="max-w-lg text-lg leading-relaxed text-bone/50 md:justify-self-end">
						{m.unclet_reviews_description()}
					</p>
				</div>
			</div>
			<PaginatedList
				queryKey={["reviews"]}
				initialPage={initialPage}
				load={(page) =>
					getReviewPage({
						data: { page },
					})
				}
				containerClassName="shell"
				emptyState={null}
				footer={({ loadMore, isFetchingNextPage }) =>
					isFetchingNextPage ? (
						<ReviewSkeleton />
					) : (
						<div className="shell pb-12">
							<Button className="cta mt-8" onClick={loadMore}>
								{m.load_more()}
							</Button>
						</div>
					)
				}
			>
				{(reviews) => (
					<div className="shell mt-14 grid grid-cols-12 gap-4">
						{reviews.map((review) => (
							<ReviewCard key={review.id} review={review} />
						))}
					</div>
				)}
			</PaginatedList>
		</section>
	);
}

// Placeholder rows while the next page loads, in the card grid's own measure.
function ReviewSkeleton() {
	return (
		<div className="shell mt-14 grid grid-cols-12 gap-4" aria-hidden="true">
			{[0, 1].map((index) => (
				<div key={index} className="review-card animate-pulse">
					<div className="h-4 w-24 bg-bone/15" />
					<div className="my-7 h-6 w-3/4 bg-bone/10" />
					<div className="h-6 w-1/2 bg-bone/10" />
				</div>
			))}
		</div>
	);
}
