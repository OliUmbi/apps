import { m } from "@oliumbi/i18n/messages";
import { Check } from "lucide-react";

export function CateringFormats() {
	// Messages resolve per render; module scope would bake one locale in (U-20).
	const formats = [
		m.unclet_services_format_private_dinner(),
		m.unclet_services_format_birthdays(),
		m.unclet_services_format_weddings(),
		m.unclet_services_format_corporate(),
		m.unclet_services_format_buffets(),
		m.unclet_services_format_fire(),
	];
	return (
		<section className="bg-paper py-24 text-night md:py-32">
			<div className="shell grid gap-16 lg:grid-cols-[.75fr_1.25fr]">
				<div>
					<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
						{m.unclet_services_formats_eyebrow()}
					</p>
					<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-5xl md:text-7xl">
						{m.unclet_services_formats_title()}
					</h2>
				</div>
				<div className="grid gap-px bg-night/15 sm:grid-cols-2">
					{formats.map((item) => (
						<div
							key={item}
							className="flex items-center gap-3 bg-paper p-6 text-lg"
						>
							<Check
								size={18}
								className="shrink-0 text-brass"
								aria-hidden="true"
							/>{" "}
							{item}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
