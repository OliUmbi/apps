import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sprout } from "lucide-react";

export function NotFound() {
	return (
		<section className="shell grid min-h-[72vh] place-items-center py-24 text-center">
			<div className="max-w-3xl">
				<span className="mx-auto grid size-16 place-items-center rounded-full bg-sage/55 text-forest">
					<Sprout size={28} aria-hidden="true" />
				</span>
				<p className="eyebrow mt-8 text-clay">
					{m.zelglihof_routes_root_paragraph()}
				</p>
				<h1 className="display-title mx-auto mt-6 max-w-2xl text-6xl md:text-8xl">
					{m.zelglihof_routes_root_heading()}
				</h1>
				<p className="mx-auto mt-6 max-w-lg text-lg text-ink/60">
					{m.zelglihof_routes_root_paragraph_2()}
				</p>
				<Link to="/" className="button-primary mt-8">
					<ArrowLeft size={17} aria-hidden="true" />
					{m.zelglihof_routes_root_text()}
				</Link>
			</div>
		</section>
	);
}
