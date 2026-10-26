import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { Alert } from "@oliumbi/ui/alert";
import type {
	SubmissionField,
	SubmissionFieldName,
} from "@oliumbi/ui/submission-types";
import { useSubmissionForm } from "@oliumbi/ui/use-submission-form";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { SubmissionControl } from "./submission-control";

export function SubmissionForm<Input extends { submissionId: string }, Result>({
	schema,
	fields,
	submit,
	success = () => m.sent(),
	className = "",
	submitLabel = m.submit(),
}: {
	schema: z.ZodType<Input>;
	fields: readonly SubmissionField<Input>[];
	submit: (data: Input) => Promise<Result>;
	success?: (result: Result) => ReactNode;
	className?: string;
	submitLabel?: string;
}) {
	// One submission id per form fill: a retry of the same fill replays the same
	// id, so the server reports the original outcome instead of committing twice.
	const [submissionId] = useState(() => crypto.randomUUID());
	const form = useSubmissionForm<Input, Result>({
		schema,
		fields,
		submit,
		success,
		defaults: { submissionId } as Partial<
			Record<SubmissionFieldName<Input>, unknown>
		>,
	});
	if (form.succeeded) return <SuccessReceipt>{form.success}</SuccessReceipt>;
	return (
		<Form
			className={`grid gap-5 ${className}`}
			onSubmit={form.onSubmit}
			onChange={form.onChange}
		>
			{fields.map((field) => (
				<div
					key={field.name}
					className={
						field.wide ? "form-control-wrap is-wide" : "form-control-wrap"
					}
				>
					<SubmissionControl
						field={field}
						error={form.errors[field.name]}
						disabled={form.pending}
					/>
				</div>
			))}
			{/* Honeypot (X-04): a real-but-hidden input humans never see or fill;
			    a filled value makes the server drop the submission silently. No
			    visible text on purpose - a bot must not learn the field exists. */}
			<input
				type="text"
				name="website"
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				autoComplete="off"
			/>
			<Alert tone="error">{form.error}</Alert>
			<Button
				type="submit"
				className="cta disabled:opacity-50"
				disabled={form.pending}
			>
				{form.pending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}

function SuccessReceipt({ children }: { children: ReactNode }) {
	const receipt = useRef<HTMLDivElement>(null);
	// Swapping in the receipt unmounts the focused submit button; moving focus to
	// the receipt keeps keyboard and screen-reader users with the change.
	useEffect(() => {
		receipt.current?.focus();
	}, []);
	return (
		<div ref={receipt} tabIndex={-1} className="grid gap-5 outline-none">
			<Alert tone="success">{children}</Alert>
		</div>
	);
}
