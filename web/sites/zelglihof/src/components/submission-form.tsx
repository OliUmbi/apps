import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { Alert } from "@oliumbi/ui/alert";
import type { SubmissionFieldName } from "@oliumbi/ui/submission-types";
import { useSubmissionForm } from "@oliumbi/ui/use-submission-form";
import { type ReactNode, useState } from "react";
import type { z } from "zod";
import { type SiteField, SubmissionControl } from "./submission-control";

// One submission id per form fill: a retry of the same fill replays the same
// id, so the server reports the original outcome instead of committing twice.
// The forms whose schema keys idempotency on `submissionId` pass it through
// `defaults`; schemas keying it elsewhere (the newsletter keys on the address)
// simply do not.
export function useSubmissionId(): string {
	return useState(() => crypto.randomUUID())[0];
}

export function SubmissionForm<Input, Result>({
	schema,
	fields,
	submit,
	getResultError,
	defaults,
	success = () => m.sent(),
	className = "",
	submitLabel = m.submit(),
}: {
	schema: z.ZodType<Input>;
	fields: readonly SiteField<Input>[];
	submit: (data: Input) => Promise<Result>;
	getResultError?: (result: Result) => string | null;
	defaults?: Partial<Record<SubmissionFieldName<Input>, unknown>>;
	success?: (result: Result) => ReactNode;
	className?: string;
	submitLabel?: string;
}) {
	const form = useSubmissionForm({
		schema,
		submit,
		fields,
		defaults,
		getResultError,
		success,
	});
	// The receipt replaces the form; `Alert` reserves its slot, so swapping
	// states never moves the elements around it.
	if (form.succeeded) return <Alert tone="success">{form.success}</Alert>;
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
					<SubmissionControl
						field={field}
						disabled={form.pending}
						error={form.errors[field.name]}
					/>
				</div>
			))}
			<Alert tone="error">{form.error}</Alert>
			<Button type="submit" className="cta" disabled={form.pending}>
				{form.pending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}
