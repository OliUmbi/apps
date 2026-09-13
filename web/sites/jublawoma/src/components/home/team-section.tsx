import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function TeamSection() {
	return (
		<section className="shell grid items-center gap-12 pb-24 lg:grid-cols-[1.3fr_.7fr] lg:pb-36">
			<img
				className="aspect-[4/3] w-full rounded-3xl object-cover"
				src="/assets/images/people/leiter.jpg"
				alt={m.jublawoma_home_team_alt()}
			/>
			<div>
				<p className="kicker">{m.jublawoma_home_team_eyebrow()}</p>
				<h2 className="my-5 text-[clamp(2.5rem,5vw,3.6rem)] leading-none tracking-[-.05em]">
					{m.jublawoma_home_team_title()}
				</h2>
				<p className="leading-relaxed text-bark/65">
					{m.jublawoma_home_team_copy()}
				</p>
				<Link to="/about" className="text-link mt-5">
					{m.jublawoma_home_team_action()}
					<ArrowRight size={16} />
				</Link>
			</div>
		</section>
	);
}
