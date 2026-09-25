import { m } from "@oliumbi/i18n/messages";
import { Check } from "lucide-react";

export function CateringFormats() {
	return (
		<section className="bg-paper py-24 text-night md:py-32">
			<div className="shell grid gap-16 lg:grid-cols-[.75fr_1.25fr]">
				<div>
					<p className="eyebrow text-brass">
						{m.unclet_services_formats_eyebrow()}
					</p>
					<h2 className="display-title mt-6 text-5xl md:text-7xl">
						{m.unclet_services_formats_title()}
					</h2>
				</div>
				<div className="grid gap-px bg-night/15 sm:grid-cols-2">
					{[
						"Private Dinner zuhause",
						"Geburtstage & Familienfeste",
						"Hochzeiten",
						"Firmenessen & Apéros",
						"Buffets & Flying Dinner",
						"Kochen am Feuer",
					].map((item) => (
						<div
							key={item}
							className="flex items-center gap-3 bg-paper p-6 text-lg"
						>
							<Check size={18} className="shrink-0 text-brass" /> {item}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
