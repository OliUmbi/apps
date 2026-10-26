import { safeLinkHref } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { ArrowUpRight } from "lucide-react";
import type { PublicPromotion } from "../../model/content";
import { MediaImage } from "../media-image";

export function Promotions({
	promotions,
}: {
	promotions: PublicPromotion[] | null;
}) {
	// The route loader seeds this list; `null` marks a failed load so the page
	// degrades to an honest error instead of silently showing nothing (J-07).
	if (promotions === null)
		return (
			<p className="shell pt-8 pb-20 text-center text-bark-soft" role="alert">
				{m.error_generic()}
			</p>
		);
	if (!promotions.length) return null;
	return (
		<div className="shell pt-8 pb-20">
			{promotions.map((promotion) => (
				<a
					key={promotion.id}
					href={safeLinkHref(promotion.link)}
					className="promotion-card group"
				>
					<div className="min-h-[18rem] bg-sage max-[850px]:min-h-[14rem]">
						<MediaImage
							src={promotion.image?.src}
							alt={promotion.image?.alt || promotion.title}
							seed={promotion.id}
							sizes="(min-width: 850px) 38vw, 100vw"
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="promotion-body">
						<p className="kicker">{m.jublawoma_promotion_eyebrow()}</p>
						<h2 className="text-2xl font-bold">{promotion.title}</h2>
						<p className="mt-2 text-bark/70">{promotion.description}</p>
						<span className="mt-6 inline-flex items-center gap-2 border-b-2 border-current pb-[0.35rem] font-extrabold">
							{m.jublawoma_promotion_link()}{" "}
							<ArrowUpRight size={18} aria-hidden="true" />
						</span>
					</div>
				</a>
			))}
		</div>
	);
}
