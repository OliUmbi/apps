import { m } from "@oliumbi/i18n/messages";
import { ShoppingBag } from "lucide-react";

export function ShopEmptyState() {
	return (
		<div className="flex items-start gap-4 rounded-3xl bg-cream p-7">
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
	);
}
