import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function InquiryInvitation() {
	return (
		<section className="border-y border-brass/25 bg-brass py-20 text-night md:py-28">
			<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] grid gap-10 md:grid-cols-[1.3fr_.7fr] md:items-end">
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
					<Link
						to="/inquiry"
						className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-night bg-night px-[1.25rem] py-[0.75rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-bone transition-colors hover:bg-brass-light hover:text-night mt-7"
					>
						{m.unclet_home_inquire()}
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}
