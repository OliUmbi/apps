import { m } from "@oliumbi/i18n/messages";
import { inquirySchema } from "@oliumbi/unclet-data/contracts";
import { useServerFn } from "@tanstack/react-start";
import { sendInquiry } from "../data/inquiries";
import { SubmissionForm } from "./submission-form";

export function InquiryForm() {
	const submit = useServerFn(sendInquiry);
	return (
		<div className="relative overflow-hidden border border-bone/15 bg-[linear-gradient(135deg,rgb(185_154_91_/_10%),transparent_46%),#1a1a17] p-[clamp(1.5rem,5vw,4rem)] before:absolute before:top-0 before:left-0 before:h-0.5 before:w-28 before:bg-brass before:content-['']">
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
				fields={[
					{
						name: "name",
						label: m.name(),
						placeholder: m.unclet_inquiry_name_placeholder(),
						autoComplete: "name",
						required: true,
					},
					{
						name: "email",
						label: m.email(),
						type: "email",
						placeholder: "name@beispiel.ch",
						autoComplete: "email",
						required: true,
					},
					{
						name: "phone",
						label: m.phone(),
						type: "tel",
						placeholder: "079 123 45 67",
						autoComplete: "tel",
						required: true,
					},
					{
						name: "date",
						label: m.date(),
						type: "date",
					},
					{
						name: "location",
						label: m.location(),
						placeholder: m.unclet_inquiry_location_placeholder(),
					},
					{
						name: "guests",
						label: m.guests(),
						type: "number",
						min: 1,
						required: true,
					},
					{
						name: "note",
						label: m.unclet_inquiry_idea(),
						type: "textarea",
						placeholder: m.unclet_inquiry_note_placeholder(),
						wide: true,
					},
				]}
			/>
		</div>
	);
}
