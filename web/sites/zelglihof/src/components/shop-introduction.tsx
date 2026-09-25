import { m } from "@oliumbi/i18n/messages";
import { Clock3, ShoppingBag } from "lucide-react";
export function ShopIntroduction() {
	return (
		<section className="shell grid gap-8 py-14 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-24">
			<div>
				<p className="eyebrow text-clay">{m.zelglihof_shop_eyebrow()}</p>
				<h1 className="display-title mt-5 text-6xl md:text-8xl">
					{m.zelglihof_shop_title()}
					<br />
					{m.zelglihof_shop_title_accent()}
				</h1>
			</div>
			<div className="md:pb-2 md:pl-16">
				<p className="max-w-xl text-xl leading-relaxed text-ink/65">
					{m.zelglihof_shop_description()}
				</p>
				<div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
					<span className="flex items-center gap-2">
						<ShoppingBag size={18} className="text-clay" />
						{m.zelglihof_shop_farm_direct()}
					</span>
					<span className="flex items-center gap-2">
						<Clock3 size={18} className="text-clay" />
						{m.zelglihof_shop_while_stocks_last()}
					</span>
				</div>
			</div>
		</section>
	);
}
