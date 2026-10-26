import { safeLinkHref } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { getPromotions } from "../data/promotions";
import type { PublicPromotion } from "../model/content";

// Seeded from the home loader so the strip is in the server-rendered page from
// the start; a failed refresh reports instead of silently rendering nothing.
export function Promotions({
	initialPromotions,
}: {
	initialPromotions: PublicPromotion[];
}) {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () => getPromotions(),
		initialData: initialPromotions,
	});
	if (query.isError)
		return (
			<p className="shell py-6 text-sm text-danger" role="alert">
				{m.error_generic()}
			</p>
		);
	if (!query.data?.length) return null;
	return (
		<div className="shell grid gap-4 py-6">
			{query.data.map((promotion) => (
				<a
					key={promotion.id}
					href={safeLinkHref(promotion.link)}
					className="grid gap-4 rounded-3xl bg-sage/40 p-8 sm:grid-cols-[1fr_auto]"
				>
					<div>
						<h2 className="font-serif text-3xl">{promotion.title}</h2>
						<p className="mt-3 text-ink/65">{promotion.description}</p>
					</div>
					<ArrowUpRight className="self-center" size={30} aria-hidden="true" />
				</a>
			))}
		</div>
	);
}
