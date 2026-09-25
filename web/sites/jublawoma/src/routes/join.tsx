import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";

export const Route = createFileRoute("/join")({ component: Join });
function Join() {
	return (
		<>
			<section className="page-hero shell join-hero">
				<div>
					<p className="kicker">{m.jublawoma_join_eyebrow()}</p>
					<h1>
						{m.jublawoma_join_title_discover()}
						<br />
						<span>{m.jublawoma_join_title_participate()}</span>
						<br />
						{m.jublawoma_join_title_belong()}
					</h1>
					<p>{m.jublawoma_join_description()}</p>
				</div>
				<img src="/assets/images/doodles/dog.svg" alt="" />
			</section>
			<section className="shell steps">
				<article>
					<span>1</span>
					<h2>{m.jublawoma_join_contact_title()}</h2>
					<p>{m.jublawoma_join_contact_body()}</p>
				</article>
				<article>
					<span>2</span>
					<h2>{m.jublawoma_join_trial_title()}</h2>
					<p>{m.jublawoma_join_trial_body()}</p>
				</article>
				<article>
					<span>3</span>
					<h2>{m.jublawoma_join_register_title()}</h2>
					<p>{m.jublawoma_join_register_body()}</p>
				</article>
			</section>
			<section className="contact-card shell">
				<img src="/assets/images/doodles/groovy-sitting.svg" alt="" />
				<div>
					<p className="kicker light">{m.jublawoma_join_questions_eyebrow()}</p>
					<h2>{m.jublawoma_join_questions_title()}</h2>
					<div className="button-row">
						<a className="button light" href="mailto:scharleitung@jublawoma.ch">
							<Mail size={17} />
							{m.jublawoma_join_contact_leadership()}
						</a>
						<a
							className="text-link light"
							href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
							target="_blank"
							rel="noopener"
						>
							<Download size={16} />
							{m.jublawoma_join_open_registration()}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
