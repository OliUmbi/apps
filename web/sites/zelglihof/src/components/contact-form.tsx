import { m } from "@oliumbi/i18n/messages";
import { contactSchema } from "@oliumbi/zelglihof-data/forms";
import { useServerFn } from "@tanstack/react-start";
import { sendContactInquiry } from "../data/contact";
import { SubmissionForm, useSubmissionId } from "./submission-form";

export function ContactForm() {
	const submit = useServerFn(sendContactInquiry);
	const submissionId = useSubmissionId();
	return (
		<div className="contact-form-card">
			<header>
				<p className="eyebrow text-clay">{m.zelglihof_contact_eyebrow()}</p>
				<h2 className="mt-4 font-serif text-4xl font-bold">
					{m.zelglihof_contact_title()}
				</h2>
				<p className="mt-3 max-w-xl leading-relaxed text-ink/60">
					{m.zelglihof_contact_description()}
				</p>
			</header>
			<SubmissionForm
				className="two-column-form"
				schema={contactSchema}
				defaults={{ subject: "other", submissionId }}
				submit={(data) => submit({ data })}
				submitLabel={m.zelglihof_contact_submit()}
				success={(result) => (
					<>
						{m.sent()}{" "}
						{m.zelglihof_submission_reference({ reference: result.reference })}
					</>
				)}
				fields={[
					{
						name: "name",
						kind: "text",
						label: m.name(),
						placeholder: m.zelglihof_contact_name_placeholder(),
						autoComplete: "name",
						required: true,
					},
					{
						name: "email",
						kind: "email",
						label: m.email(),
						placeholder: "dein.name@beispiel.ch",
						autoComplete: "email",
					},
					{
						name: "phone",
						kind: "tel",
						label: m.phone(),
						placeholder: "079 123 45 67",
						autoComplete: "tel",
						required: true,
					},
					{
						name: "message",
						kind: "textarea",
						label: m.message(),
						placeholder: m.zelglihof_contact_message_placeholder(),
						wide: true,
						required: true,
					},
				]}
			/>
		</div>
	);
}
