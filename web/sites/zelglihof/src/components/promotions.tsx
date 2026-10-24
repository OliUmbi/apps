import { safeLinkHref } from "@oliumbi/contracts";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { getPromotions } from "../data/promotions";

export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () => getPromotions(),
	});
	if (!query.data?.length) return null;
	return (
		<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] grid gap-4 py-6">
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
