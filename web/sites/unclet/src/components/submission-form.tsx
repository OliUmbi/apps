import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useSubmissionForm } from "@oliumbi/ui/use-submission-form";
import { useState } from "react";
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
	className = "",
	submitLabel = m.submit(),
}: {
	schema: z.ZodType<Input>;
	fields: SubmissionField[];
	submit: (data: Input) => Promise<Result>;
	getResultError?: (result: Result) => string | null;
	defaults?: Record<string, unknown>;
	success?: string;
	className?: string;
	submitLabel?: string;
}) {
	// One submission id per form fill: a retry of the same fill replays the same
	// id, so the server reports the original outcome instead of committing twice.
	const [submissionId] = useState(() => crypto.randomUUID());
	const form = useSubmissionForm({
		schema,
		submit,
		getResultError,
		defaults: { ...defaults, submissionId },
		numberFields: fields
			.filter((field) => field.type === "number" || field.type === "rating")
			.map((field) => field.name),
	});
	if (form.succeeded) return <FormFeedback success={success} />;
	return (
		<Form
			className={`submission-form grid gap-5 ${className}`}
			onSubmit={form.onSubmit}
			onChange={form.onChange}
		>
			{fields.map((field) => (
				<div
					key={field.name}
					className={`form-control-wrap ${field.wide ? "is-wide" : ""}`}
				>
					<SubmissionControl field={field} disabled={form.pending} />
				</div>
			))}
			<FormFeedback error={form.error} />
			<Button
				type="submit"
				className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light disabled:opacity-50"
				disabled={form.pending}
			>
				{form.pending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}
