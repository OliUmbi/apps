import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
	return (
		<section className="shell not-found">
			<div>
				<p className="kicker">404 · Verirrt</p>
				<h1>{m.jublawoma_routes_root_heading()}</h1>
				<p className="not-found-copy">{m.jublawoma_not_found_description()}</p>
				<Link to="/" className="button dark">
					<ArrowLeft size={17} aria-hidden="true" />
					{m.jublawoma_routes_root_text()}
				</Link>
			</div>
			<img src="/assets/images/doodles/strolling.svg" alt="" />
		</section>
	);
}
