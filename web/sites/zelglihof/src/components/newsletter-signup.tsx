import { m } from "@oliumbi/i18n/messages";
import { newsletterSignupSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { Check, Mail } from "lucide-react";
import { signupForNewsletter } from "../newsletter/newsletter.functions";
import { SubmissionForm } from "./ui/submission-form";
export function NewsletterSignup() {
	const submit = useServerFn(signupForNewsletter);
	return (
		<section id="newsletter" className="newsletter-section py-20 md:py-28">
			<div className="shell newsletter-panel">
				<div className="newsletter-copy">
					<span className="newsletter-icon" aria-hidden="true">
						<Mail size={24} />
					</span>
					<p className="eyebrow text-sun">{m.zelglihof_newsletter_eyebrow()}</p>
					<h2 className="display-title mt-5 text-5xl md:text-6xl">
						{m.zelglihof_newsletter_title()}
					</h2>
					<p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
						{m.zelglihof_newsletter_intro()}
					</p>
				</div>
				<div className="newsletter-action">
					<ul className="newsletter-benefits">
						{[
							m.zelglihof_newsletter_benefit_1(),
							m.zelglihof_newsletter_benefit_2(),
							m.zelglihof_newsletter_benefit_3(),
						].map((benefit) => (
							<li key={benefit}>
								<Check size={17} aria-hidden="true" /> {benefit}
							</li>
						))}
					</ul>
					<SubmissionForm
						className="newsletter-form"
						schema={newsletterSignupSchema}
						submit={(data) => submit({ data })}
						success={m.zelglihof_components_newsletter_signup_success()}
						submitLabel={m.zelglihof_newsletter_submit()}
						fields={[
							{
								name: "email",
								label: m.zelglihof_components_newsletter_signup_label(),
								type: "email",
								placeholder: "dein.name@beispiel.ch",
								autoComplete: "email",
								required: true,
							},
						]}
					/>
					<p className="newsletter-privacy">
						{m.zelglihof_newsletter_privacy()}
					</p>
				</div>
			</div>
		</section>
	);
}
