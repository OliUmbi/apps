import { m } from "@oliumbi/i18n/messages";
import type { Product } from "../model/content";
import { ReservationForm } from "./reservation-form";

export function ProductReservation({ product }: { product: Product }) {
	return (
		<section className="shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
			<div>
				<p className="eyebrow text-moss">
					{m.zelglihof_product_reservation_eyebrow()}
				</p>
				<h2 className="display-title mt-5 text-5xl">
					{m.zelglihof_product_reservation_title()}
				</h2>
				<div className="mt-8 grid gap-6 text-sm leading-relaxed text-ink/60">
					<p>
						<strong className="block text-ink">
							{m.zelglihof_product_selection_title()}
						</strong>
						{m.zelglihof_product_selection_body()}
					</p>
					<p>
						<strong className="block text-ink">
							{m.zelglihof_product_confirmation_title()}
						</strong>
						{m.zelglihof_product_confirmation_body()}
					</p>
					<p>
						<strong className="block text-ink">
							{m.zelglihof_product_pickup_title()}
						</strong>
						{m.zelglihof_product_pickup_body()}
					</p>
				</div>
			</div>
			{product.reservationOpen ? (
				<ReservationForm product={product} />
			) : (
				<div>
					<div className="rounded-[1.5rem] bg-sun p-7 md:p-9">
						<p className="eyebrow">
							{m.zelglihof_product_out_of_season_eyebrow()}
						</p>
						<h2 className="mt-5 font-serif text-4xl font-bold">
							{m.zelglihof_product_out_of_season_title()}
						</h2>
						<p className="mt-4 leading-relaxed text-ink/65">
							{m.zelglihof_product_out_of_season_body()}
						</p>
					</div>
				</div>
			)}
		</section>
	);
}
