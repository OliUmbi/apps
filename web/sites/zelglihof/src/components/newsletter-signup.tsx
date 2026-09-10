import { m } from "@oliumbi/i18n/messages";
import { newsletterSignupSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { signupForNewsletter } from "../newsletter/newsletter.functions";
import { SubmissionForm } from "./ui/submission-form";
export function NewsletterSignup() {
	const submit = useServerFn(signupForNewsletter);
	return (
		<section className="shell py-12">
			<h2 className="mb-6 font-serif text-3xl">
				{m.zelglihof_components_newsletter_signup_heading()}
			</h2>
			<SubmissionForm
				schema={newsletterSignupSchema}
				submit={(data) => submit({ data })}
				success={m.zelglihof_components_newsletter_signup_success()}
				fields={[
					{
						name: "email",
						label: m.zelglihof_components_newsletter_signup_label(),
						type: "email",
						required: true,
					},
				]}
			/>
		</section>
	);
}
