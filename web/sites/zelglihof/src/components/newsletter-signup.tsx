import { m } from "@oliumbi/i18n/messages";
import { newsletterSignupSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { Check, Mail } from "lucide-react";
import { signupForNewsletter } from "../data/newsletter";
import { SubmissionForm } from "./submission-form";

export function NewsletterSignup() {
	const submit = useServerFn(signupForNewsletter);
	return (
		<section id="newsletter" className="text-cream bg-forest py-20 md:py-28">
			<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] grid items-center gap-[clamp(2rem,7vw,6rem)] md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
				<div className="newsletter-body">
					<span
						className="mb-8 grid size-[3.4rem] place-items-center rounded-full border border-cream/25 text-sun"
						aria-hidden="true"
					>
						<Mail size={24} />
					</span>
					<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-sun">
						{m.zelglihof_newsletter_eyebrow()}
					</p>
					<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 text-5xl md:text-6xl">
						{m.zelglihof_newsletter_title()}
					</h2>
					<p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
						{m.zelglihof_newsletter_description()}
					</p>
				</div>
				<div className="newsletter-action">
					<ul className="newsletter-benefits">
						{[
							m.zelglihof_newsletter_benefit_season_dates(),
							m.zelglihof_newsletter_benefit_products_pickup(),
							m.zelglihof_newsletter_benefit_occasional_updates(),
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
						success={m.zelglihof_newsletter_signup_success()}
						submitLabel={m.zelglihof_newsletter_submit()}
						fields={[
							{
								name: "email",
								label: m.email(),
								type: "email",
								placeholder: "dein.name@beispiel.ch",
								autoComplete: "email",
								required: true,
							},
						]}
					/>
					<p className="mt-4 text-xs leading-[1.6] text-cream/48">
						{m.zelglihof_newsletter_privacy()}
					</p>
				</div>
			</div>
		</section>
	);
}
