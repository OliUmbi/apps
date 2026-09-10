import { m } from "@oliumbi/i18n/messages";
import { inquirySchema } from "@oliumbi/unclet-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { sendInquiry } from "../inquiry/inquiry.functions";
import { SubmissionForm } from "./ui/submission-form";
export function InquiryForm() {
	const submit = useServerFn(sendInquiry);
	return (
		<SubmissionForm
			schema={inquirySchema}
			submit={(data) => submit({ data })}
			fields={[
				{
					name: "name",
					label: m.unclet_components_inquiry_form_label(),
					required: true,
				},
				{
					name: "email",
					label: m.unclet_components_inquiry_form_label_2(),
					type: "email",
					required: true,
				},
				{
					name: "phone",
					label: m.unclet_components_inquiry_form_label_3(),
					type: "tel",
					required: true,
				},
				{
					name: "date",
					label: m.unclet_components_inquiry_form_label_4(),
					type: "date",
				},
				{ name: "location", label: m.unclet_components_inquiry_form_label_5() },
				{
					name: "guests",
					label: m.unclet_components_inquiry_form_label_6(),
					type: "number",
					min: 1,
					required: true,
				},
				{
					name: "note",
					label: m.unclet_components_inquiry_form_label_7(),
					type: "textarea",
				},
			]}
		/>
	);
}
