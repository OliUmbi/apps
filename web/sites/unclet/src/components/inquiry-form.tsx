import { m } from "@oliumbi/i18n/messages";
import { inquirySchema } from "@oliumbi/unclet-data/forms";
import { useServerFn } from "@tanstack/react-start";
import { sendInquiry } from "../data/inquiries";
import { SubmissionForm } from "./submission-form";

export function InquiryForm() {
	const submit = useServerFn(sendInquiry);
	return (
		<div className="relative overflow-hidden border border-bone/15 bg-gradient-card bg-coal p-[clamp(1.5rem,5vw,4rem)] before:absolute before:top-0 before:left-0 before:h-0.5 before:w-28 before:bg-brass before:content-['']">
			<header className="mb-12">
				<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{m.unclet_inquiry_form_eyebrow()}
				</p>
				<h2 className="mt-4 font-serif text-4xl md:text-5xl">
					{m.unclet_inquiry_form_title()}
				</h2>
				<p className="mt-4 max-w-xl leading-relaxed text-bone/55">
					{m.unclet_inquiry_form_description()}
				</p>
			</header>
			<SubmissionForm
				className="two-column-form"
				schema={inquirySchema}
				submit={(data) => submit({ data })}
				submitLabel={m.unclet_inquiry_form_submit()}
				success={(result) =>
					m.unclet_inquiry_success({ reference: result.reference })
				}
				fields={[
					{
						name: "name",
						label: m.name(),
						kind: "text",
						placeholder: m.unclet_inquiry_name_placeholder(),
						autoComplete: "name",
						required: true,
					},
					{
						name: "email",
						label: m.email(),
						kind: "email",
						placeholder: m.unclet_inquiry_email_placeholder(),
						autoComplete: "email",
						required: true,
					},
					{
						name: "phone",
						label: m.phone(),
						kind: "tel",
						placeholder: m.unclet_inquiry_phone_placeholder(),
						autoComplete: "tel",
						required: true,
					},
					{
						name: "date",
						label: m.date(),
						kind: "date",
					},
					{
						name: "location",
						label: m.location(),
						kind: "text",
						placeholder: m.unclet_inquiry_location_placeholder(),
					},
					{
						name: "guests",
						label: m.guests(),
						kind: "number",
						min: 1,
						required: true,
					},
					{
						name: "note",
						label: m.unclet_inquiry_idea(),
						kind: "textarea",
						rows: 5,
						placeholder: m.unclet_inquiry_note_placeholder(),
						wide: true,
					},
				]}
			/>
		</div>
	);
}
