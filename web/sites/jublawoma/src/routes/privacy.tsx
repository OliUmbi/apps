import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
export const Route = createFileRoute("/privacy")({ component: Privacy });
function Privacy() {
	return (
		<section className="shell legal">
			<p className="kicker">{m.jublawoma_routes_privacy_paragraph()}</p>
			<h1>{m.jublawoma_routes_privacy_heading()}</h1>
			<p>{m.jublawoma_routes_privacy_paragraph_2()}</p>
			<p>{m.jublawoma_routes_privacy_paragraph_3()}</p>
			<a
				className="button dark"
				href="/assets/documents/Datenschutzerklärung-Jubla-Woma.pdf"
				target="_blank"
				rel="noopener"
			>
				<Download size={17} />
				{m.jublawoma_routes_privacy_text()}
			</a>
		</section>
	);
}
