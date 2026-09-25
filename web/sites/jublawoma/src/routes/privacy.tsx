import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

export const Route = createFileRoute("/privacy")({ component: Privacy });
function Privacy() {
	return (
		<section className="shell legal">
			<p className="kicker">{m.jublawoma_privacy_eyebrow()}</p>
			<h1>{m.privacy()}</h1>
			<p>{m.jublawoma_privacy_personal_data_body()}</p>
			<p>{m.jublawoma_privacy_legal_basis_body()}</p>
			<p>{m.jublawoma_privacy_data_processing_body()}</p>
			<a
				className="button dark"
				href="/assets/documents/Datenschutzerklärung-Jubla-Woma.pdf"
				target="_blank"
				rel="noopener"
			>
				<Download size={17} />
				{m.jublawoma_privacy_open_policy()}
			</a>
		</section>
	);
}
