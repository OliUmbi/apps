import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/legal")({ component: Imprint });
function Imprint() {
	return (
		<section className="shell legal">
			<p className="kicker">{m.jublawoma_routes_legal_paragraph()}</p>
			<h1>{m.jublawoma_routes_legal_heading()}</h1>
			<h2>{m.jublawoma_routes_legal_heading_2()}</h2>
			<p>
				{m.jublawoma_routes_legal_paragraph_2()}
				<br />
				{m.jublawoma_routes_legal_paragraph_3()}
				<br />
				{m.jublawoma_routes_legal_paragraph_4()}
			</p>
			<p>
				<a href="mailto:scharleitung@jublawoma.ch">
					{m.jublawoma_routes_legal_text()}
				</a>
			</p>
			<h2>{m.jublawoma_routes_legal_heading_3()}</h2>
			<p>{m.jublawoma_routes_legal_paragraph_5()}</p>
			<h2>{m.jublawoma_routes_legal_heading_4()}</h2>
			<p>{m.jublawoma_routes_legal_paragraph_6()}</p>
		</section>
	);
}
