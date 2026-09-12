import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { listPublicRecords } from "../content/public.functions";
import { Button } from "./ui";
export function PublicReviews() {
	const query = useInfiniteQuery({
		queryKey: ["reviews"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			listPublicRecords({
				data: { resource: "unclet.review", page: pageParam },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	if (!query.isError && !query.data?.pages.some((page) => page.items.length))
		return null;
	return (
		<section className="reviews-section border-y border-bone/10 bg-coal py-24 md:py-32">
			<div className="shell">
				<div className="grid gap-6 md:grid-cols-[.75fr_1.25fr] md:items-end">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_components_public_reviews_paragraph()}
						</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							{m.unclet_components_public_reviews_heading()}
						</h2>
					</div>
					<p className="max-w-lg text-lg leading-relaxed text-bone/50 md:justify-self-end">
						{m.unclet_reviews_intro()}
					</p>
				</div>
				{query.isError && <p role="alert">{m.error_generic()}</p>}
				<div className="review-grid mt-14">
					{query.data?.pages
						.flatMap((page) => page.items)
						.map((review) => (
							<blockquote key={String(review.id)} className="review-card">
								<div className="flex items-center justify-between gap-5">
									<p
										role="img"
										className="flex gap-1 text-brass"
										aria-label={`${review.stars} von 5 Sternen`}
									>
										{Array.from(
											{ length: Number(review.stars) },
											(_, index) => (
												<Star key={index} size={16} fill="currentColor" />
											),
										)}
									</p>
									<Quote
										size={28}
										className="text-brass/35"
										aria-hidden="true"
									/>
								</div>
								<p className="review-quote my-7 leading-relaxed text-bone/75">
									{review.description}
								</p>
								<footer className="border-t border-bone/10 pt-5 font-serif text-xl">
									{review.name}
								</footer>
							</blockquote>
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
