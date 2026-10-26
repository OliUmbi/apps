import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function InquiryInvitation() {
	return (
		<section className="border-y border-brass/25 bg-brass py-20 text-night md:py-28">
			<div className="shell grid gap-10 md:grid-cols-[1.3fr_.7fr] md:items-end">
				<div>
					<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em]">
						{m.unclet_home_inquiry_eyebrow()}
					</p>
					<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-5 text-5xl md:text-7xl">
						{m.unclet_home_inquiry_title()}
					</h2>
				</div>
				<div>
					<p className="leading-relaxed text-night/65">
						{m.unclet_home_inquiry_description()}
					</p>
					<Link to="/inquiry" className="cta inverted mt-7">
						{m.unclet_home_inquire()}
						<ArrowRight size={16} aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}
