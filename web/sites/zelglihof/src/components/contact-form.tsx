import { m } from "@oliumbi/i18n/messages";
import { contactSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { sendContactInquiry } from "../contact/contact.functions";
import { SubmissionForm } from "./ui/submission-form";
export function ContactForm() {
	const submit = useServerFn(sendContactInquiry);
	return (
		<div className="contact-form-card">
			<header>
				<p className="eyebrow text-clay">{m.zelglihof_contact_eyebrow()}</p>
				<h2 className="mt-4 font-serif text-4xl font-bold">
					{m.zelglihof_contact_title()}
				</h2>
				<p className="mt-3 max-w-xl leading-relaxed text-ink/60">
					{m.zelglihof_contact_intro()}
				</p>
			</header>
			<SubmissionForm
				className="two-column-form"
				schema={contactSchema}
				defaults={{ subject: "other" }}
				submit={(data) => submit({ data })}
				submitLabel={m.zelglihof_contact_submit()}
				fields={[
					{
						name: "name",
						label: m.zelglihof_components_contact_form_label(),
						placeholder: m.zelglihof_contact_name_placeholder(),
						autoComplete: "name",
						required: true,
					},
					{
						name: "email",
						label: m.zelglihof_components_contact_form_label_2(),
						type: "email",
						placeholder: "dein.name@beispiel.ch",
						autoComplete: "email",
					},
					{
						name: "phone",
						label: m.zelglihof_components_contact_form_label_3(),
						type: "tel",
						placeholder: "+41 79 123 45 67",
						autoComplete: "tel",
						required: true,
					},
					{
						name: "message",
						label: m.zelglihof_components_contact_form_label_4(),
						type: "textarea",
						placeholder: m.zelglihof_contact_message_placeholder(),
						wide: true,
						required: true,
					},
				]}
			/>
		</div>
	);
}
