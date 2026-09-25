import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useSubmissionForm } from "@oliumbi/ui/use-submission-form";
import type { z } from "zod";
import { SubmissionControl, type SubmissionField } from "./submission-control";

export type { SubmissionField } from "./submission-control";

export function SubmissionForm<Input, Result>({
	schema,
	fields,
	submit,
	getResultError,
	defaults = {},
	success = m.sent(),
	submitLabel = m.submit(),
	className = "",
}: {
	schema: z.ZodType<Input>;
	fields: SubmissionField[];
	submit: (data: Input) => Promise<Result>;
	getResultError?: (result: Result) => string | null;
	defaults?: Record<string, unknown>;
	success?: string;
	submitLabel?: string;
	className?: string;
}) {
	const form = useSubmissionForm({
		schema,
		submit,
		getResultError,
		defaults,
		numberFields: fields
			.filter((field) => field.type === "number")
			.map((field) => field.name),
	});
	if (form.succeeded) return <FormFeedback success={success} />;
	return (
		<Form
			className={`grid gap-5 ${className}`}
			onSubmit={form.onSubmit}
			onChange={form.onChange}
		>
			{fields.map((field) => (
				<SubmissionControl
					key={field.name}
					field={field}
					disabled={form.pending}
				/>
			))}
			<FormFeedback error={form.error} />
			<Button
				type="submit"
				className="button dark disabled:opacity-50"
				disabled={form.pending}
			>
				{form.pending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}
