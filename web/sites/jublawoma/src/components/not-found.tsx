import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
	return (
		<section className="shell status-page">
			<div>
				<p className="kicker">404 · Verirrt</p>
				<h1>{m.jublawoma_not_found_title()}</h1>
				<p className="status-page-description">
					{m.jublawoma_not_found_description()}
				</p>
				<Link to="/" className="button dark">
					<ArrowLeft size={17} aria-hidden="true" />
					{m.back_to_home()}
				</Link>
			</div>
			<img src="/assets/images/doodles/strolling.svg" alt="" />
		</section>
	);
}
