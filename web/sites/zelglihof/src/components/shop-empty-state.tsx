import { m } from "@oliumbi/i18n/messages";
import { ShoppingBag } from "lucide-react";

const range = [
	m.zelglihof_shop_range_eggs(),
	m.zelglihof_shop_range_hay(),
	m.zelglihof_shop_range_beef(),
	m.zelglihof_shop_range_fruit(),
	m.zelglihof_shop_range_pumpkin(),
	m.zelglihof_shop_range_maize(),
];

export function ShopEmptyState() {
	return (
		<div className="rounded-3xl bg-cream p-7 md:p-9">
			<div className="flex items-start gap-4">
				<ShoppingBag
					size={28}
					className="shrink-0 text-clay"
					aria-hidden="true"
				/>
				<div>
					<h2 className="font-serif text-2xl font-bold">
						{m.zelglihof_shop_empty_title()}
					</h2>
					<p className="mt-2 text-ink/65">{m.zelglihof_shop_empty_body()}</p>
				</div>
			</div>
			<div className="mt-7 border-t border-ink/10 pt-6">
				<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
					{m.zelglihof_shop_range_eyebrow()}
				</p>
				<div className="mt-4 flex flex-wrap gap-2.5">
					{range.map((item) => (
						<span
							key={item}
							className="rounded-full bg-oat px-4 py-2 text-sm font-semibold text-ink/75"
						>
							{item}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
