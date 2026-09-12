import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
	return (
		<section className="shell relative grid min-h-[78vh] place-items-center overflow-hidden pt-28 text-center">
			<span className="pointer-events-none absolute text-[clamp(14rem,38vw,34rem)] font-bold leading-none text-bone/[0.025]">
				404
			</span>
			<div className="relative z-10 max-w-3xl">
				<p className="eyebrow text-brass">{m.unclet_routes_root_paragraph()}</p>
				<h1 className="display-title mt-6 text-6xl md:text-8xl">
					{m.unclet_routes_root_heading()}
				</h1>
				<p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-bone/55">
					{m.unclet_not_found_description()}
				</p>
				<Link to="/" className="button-primary mt-10">
					<ArrowLeft size={17} aria-hidden="true" />
					{m.unclet_routes_root_text()}
				</Link>
			</div>
		</section>
	);
}
