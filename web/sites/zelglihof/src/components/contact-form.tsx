import { m } from "@oliumbi/i18n/messages";
import { contactSchema } from "@oliumbi/zelglihof-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { sendContactInquiry } from "../contact/contact.functions";
import { SubmissionForm } from "./ui/submission-form";
export function ContactForm() {
	const submit = useServerFn(sendContactInquiry);
	return (
		<SubmissionForm
			schema={contactSchema}
			defaults={{ subject: "other" }}
			submit={(data) => submit({ data })}
			fields={[
				{
					name: "name",
					label: m.zelglihof_components_contact_form_label(),
					required: true,
				},
				{
					name: "email",
					label: m.zelglihof_components_contact_form_label_2(),
					type: "email",
				},
				{
					name: "phone",
					label: m.zelglihof_components_contact_form_label_3(),
					type: "tel",
					required: true,
				},
				{
					name: "message",
					label: m.zelglihof_components_contact_form_label_4(),
					type: "textarea",
					required: true,
				},
			]}
		/>
	);
}
