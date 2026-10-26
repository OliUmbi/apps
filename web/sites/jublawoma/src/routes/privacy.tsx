import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { privacyPolicyPdf } from "../model/links";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/privacy")({
	head: () => pageHead({ title: m.privacy() }),
	component: Privacy,
});
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
				href={privacyPolicyPdf}
				target="_blank"
				rel="noopener noreferrer"
			>
				<Download size={17} aria-hidden="true" />
				{m.jublawoma_privacy_open_policy()}
			</a>
		</section>
	);
}
