import { m } from "@oliumbi/i18n/messages";
import { Quote, Star } from "lucide-react";
import type { PublicReview } from "../model/content";

export function ReviewCard({ review }: { review: PublicReview }) {
	return (
		<blockquote className="review-card">
			<div className="flex items-center justify-between gap-5">
				<p
					role="img"
					className="flex gap-1 text-brass"
					aria-label={m.star_rating({ rating: review.stars, maximum: 5 })}
				>
					{Array.from({ length: review.stars }, (_, index) => (
						<Star
							key={index}
							size={16}
							fill="currentColor"
							aria-hidden="true"
						/>
					))}
				</p>
				<Quote size={28} className="text-brass/35" aria-hidden="true" />
			</div>
			<p className="review-quote my-7 leading-relaxed text-bone/75">
				{review.description}
			</p>
			<footer className="border-t border-bone/10 pt-5 font-serif text-xl">
				{review.name}
			</footer>
		</blockquote>
	);
}
