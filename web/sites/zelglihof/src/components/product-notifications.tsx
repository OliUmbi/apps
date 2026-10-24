import { m } from "@oliumbi/i18n/messages";
import { Bell } from "lucide-react";
export function ProductNotifications() {
	return (
		<section className="bg-sage/35 py-20">
			<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
				<span className="grid size-16 place-items-center rounded-full bg-forest text-cream">
					<Bell />
				</span>
				<div>
					<h2 className="font-serif text-3xl font-bold">
						{m.zelglihof_shop_newsletter_title()}
					</h2>
					<p className="mt-2 text-ink/60">
						{m.zelglihof_shop_newsletter_body()}
					</p>
				</div>
				<a
					href="#newsletter"
					className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-transparent bg-forest px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-cream transition hover:-translate-y-0.5 hover:bg-[#172f20]"
				>
					{m.zelglihof_shop_subscribe()}
				</a>
			</div>
		</section>
	);
}
