import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
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
		<section className="shell py-20">
			<p className="eyebrow text-brass">
				{m.unclet_components_public_reviews_paragraph()}
			</p>
			<h2 className="display-title my-6 text-5xl">
				{m.unclet_components_public_reviews_heading()}
			</h2>
			{query.isError && <p role="alert">{m.error_generic()}</p>}
			<div className="grid gap-8 md:grid-cols-3">
				{query.data?.pages
					.flatMap((page) => page.items)
					.map((review) => (
						<blockquote
							key={String(review.id)}
							className="border-t border-brass/40 pt-6"
						>
							<p
								role="img"
								className="text-brass"
								aria-label={`${review.stars} von 5 Sternen`}
							>
								{"★".repeat(Math.min(5, Math.max(0, Number(review.stars))))}
							</p>
							<p className="my-5 leading-relaxed text-bone/70">
								{review.description}
							</p>
							<footer className="font-serif text-xl">{review.name}</footer>
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
		</section>
	);
}
