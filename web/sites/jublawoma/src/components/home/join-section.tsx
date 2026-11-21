import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function JoinSection() {
	return (
		<section className="border-y border-ink/15 bg-mist text-ink">
			<div className="shell grid min-h-[560px] items-center gap-10 py-16 md:grid-cols-[.8fr_1.2fr]">
				<img
					className="max-h-[460px] w-full object-contain"
					src="/images/doodles/loving.svg"
					alt=""
				/>
				<div>
					<p className="kicker">{m.jublawoma_home_join_eyebrow()}</p>
					<h2 className="my-4 text-[clamp(2.6rem,5vw,5.3rem)] leading-[.95] tracking-[-.06em]">
						{m.jublawoma_home_join_title()}
					</h2>
					<p className="max-w-2xl text-lg leading-relaxed text-ink-soft">
						{m.jublawoma_home_join_body()}
					</p>
					<Link to="/join" className="button dark mt-6">
						{m.jublawoma_home_join_action()}
						<ArrowRight size={18} aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}
