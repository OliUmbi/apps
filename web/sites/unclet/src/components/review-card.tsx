import { m } from "@oliumbi/i18n/messages";
import { Quote, Star } from "lucide-react";
import type { PublicReview } from "../model/content";

const starSlots = 5;

export function ReviewCard({ review }: { review: PublicReview }) {
	return (
		<blockquote className="review-card">
			<div className="flex items-center justify-between gap-5">
				<p
					role="img"
					className="flex gap-1 text-brass"
					aria-label={m.star_rating({
						rating: review.stars,
						maximum: starSlots,
					})}
				>
					{/* All five slots always render: filled ones solid, the rest as
					    outlines, so a partial rating never reads ambiguously (U-19). */}
					{Array.from({ length: starSlots }, (_, index) => (
						<Star
							key={index}
							size={16}
							fill={index < review.stars ? "currentColor" : "none"}
							className={index < review.stars ? undefined : "text-brass/35"}
							aria-hidden="true"
						/>
					))}
				</p>
				<Quote size={28} className="text-brass/35" aria-hidden="true" />
			</div>
			<p className="font-serif text-[clamp(1.2rem,2vw,1.7rem)] my-7 leading-relaxed text-bone/75">
				{review.description}
			</p>
			<footer className="border-t border-bone/10 pt-5 font-serif text-xl">
				{review.name}
			</footer>
		</blockquote>
	);
}
