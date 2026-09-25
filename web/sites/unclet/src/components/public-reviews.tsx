import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReviewPage } from "../data/reviews";
import { ReviewCard } from "./review-card";

export function PublicReviews() {
	const query = useInfiniteQuery({
		queryKey: ["reviews"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getReviewPage({
				data: { page: pageParam },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	const reviews = query.data?.pages.flatMap((page) => page.items) ?? [];
	if (!query.isError && !reviews.length) return null;
	return (
		<section className="reviews-section border-y border-bone/10 bg-coal py-24 md:py-32">
			<div className="shell">
				<div className="grid gap-6 md:grid-cols-[.75fr_1.25fr] md:items-end">
					<div>
						<p className="eyebrow text-brass">{m.unclet_reviews_eyebrow()}</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							{m.unclet_reviews_title()}
						</h2>
					</div>
					<p className="max-w-lg text-lg leading-relaxed text-bone/50 md:justify-self-end">
						{m.unclet_reviews_description()}
					</p>
				</div>
				{query.isError && <p role="alert">{m.error_generic()}</p>}
				<div className="review-grid mt-14">
					{reviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</div>
				{query.hasNextPage && (
					<Button
						className="button-primary mt-8"
						disabled={query.isFetchingNextPage}
						onClick={() => {
							void query.fetchNextPage();
						}}
					>
						{m.load_more()}
					</Button>
				)}
			</div>
		</section>
	);
}
