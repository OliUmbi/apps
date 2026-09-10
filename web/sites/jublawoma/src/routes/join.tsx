import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";
export const Route = createFileRoute("/join")({ component: Join });
function Join() {
	return (
		<>
			<section className="page-hero shell join-hero">
				<div>
					<p className="kicker">{m.jublawoma_routes_join_paragraph()}</p>
					<h1>
						{m.jublawoma_routes_join_heading()}
						<br />
						<span>{m.jublawoma_routes_join_text()}</span>
						<br />
						{m.jublawoma_routes_join_heading_2()}
					</h1>
					<p>{m.jublawoma_routes_join_paragraph_2()}</p>
				</div>
				<img src="/assets/images/doodles/dog.svg" alt="" />
			</section>
			<section className="shell steps">
				<article>
					<span>1</span>
					<h2>{m.jublawoma_routes_join_heading_3()}</h2>
					<p>{m.jublawoma_routes_join_paragraph_3()}</p>
				</article>
				<article>
					<span>2</span>
					<h2>{m.jublawoma_routes_join_heading_4()}</h2>
					<p>{m.jublawoma_routes_join_paragraph_4()}</p>
				</article>
				<article>
					<span>3</span>
					<h2>{m.jublawoma_routes_join_heading_5()}</h2>
					<p>{m.jublawoma_routes_join_paragraph_5()}</p>
				</article>
			</section>
			<section className="contact-card shell">
				<img src="/assets/images/doodles/groovy-sitting.svg" alt="" />
				<div>
					<p className="kicker light">
						{m.jublawoma_routes_join_paragraph_6()}
					</p>
					<h2>{m.jublawoma_routes_join_heading_6()}</h2>
					<div className="button-row">
						<a className="button light" href="mailto:scharleitung@jublawoma.ch">
							<Mail size={17} />
							{m.jublawoma_routes_join_text_2()}
						</a>
						<a
							className="text-link light"
							href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
							target="_blank"
							rel="noopener"
						>
							<Download size={16} />
							{m.jublawoma_routes_join_text_3()}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
