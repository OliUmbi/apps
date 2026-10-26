import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";
import { contactMailto, registrationFormPdf } from "../model/links";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/join")({
	head: () =>
		pageHead({
			title: m.jublawoma_navigation_join(),
			description: m.jublawoma_join_description(),
		}),
	component: Join,
});
function Join() {
	return (
		<>
			<section className="page-hero shell">
				<div>
					<p className="kicker">{m.jublawoma_join_eyebrow()}</p>
					<h1>
						{m.jublawoma_join_title_discover()}
						<br />
						<span className="font-serif font-normal italic text-moss">
							{m.jublawoma_join_title_participate()}
						</span>
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
						<a className="button light" href={contactMailto}>
							<Mail size={17} aria-hidden="true" />
							{m.jublawoma_join_contact_leadership()}
						</a>
						<a
							className="cta"
							href={registrationFormPdf}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Download size={16} aria-hidden="true" />
							{m.jublawoma_join_open_registration()}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
