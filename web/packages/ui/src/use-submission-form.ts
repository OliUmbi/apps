import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import type { z } from "zod";
import {
	coerceSubmissionValues,
	type SubmissionErrorReason,
	type SubmissionErrors,
	type SubmissionField,
	type SubmissionFieldErrors,
	type SubmissionFieldName,
	submissionErrors,
} from "./submission-types";

export interface SubmissionFormOptions<Input, Result> {
	schema: z.ZodType<Input>;
	submit: (data: Input) => Promise<Result>;
	// Descriptors for the rendered controls; coercion derives from each kind.
	fields: readonly SubmissionField<Input>[];
	// Defaults merge under the submitted values, so hidden values folded in per
	// form fill survive while submitted fields keep the user's input.
	defaults?: Partial<Record<SubmissionFieldName<Input>, unknown>>;
	getResultError?: (result: Result) => string | null;
	// Receipt renderer for results that carry a reference (e.g. reservations).
	success?: (result: Result) => ReactNode;
}

export interface SubmissionFormState<Input> {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: () => void;
	// Per-field reasons keyed by schema path; render one message per field in a
	// reserved slot. Translate with `validationMessage`.
	errors: SubmissionFieldErrors<Input>;
	// Form-level feedback: server errors, result errors, and validation issues
	// without a field path. Field errors never land here.
	error: string | null;
	pending: boolean;
	succeeded: boolean;
	success: ReactNode | null;
}

export function useSubmissionForm<Input, Result>(
	options: SubmissionFormOptions<Input, Result>,
): SubmissionFormState<Input> {
	const { schema, submit, getResultError, success: renderSuccess } = options;
	const [invalid, setInvalid] = useState(false);
	const [errors, setErrors] = useState<SubmissionErrors<Input>>(
		emptySubmissionErrors,
	);
	const mutation = useMutation({ mutationFn: submit });

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) return;
		const form = new FormData(event.currentTarget);
		const values = coerceSubmissionValues(
			form,
			options.fields,
			options.defaults ?? {},
		);
		const result = schema.safeParse(values);
		setInvalid(!result.success);
		if (result.success) {
			setErrors(emptySubmissionErrors);
			mutation.mutate(result.data);
		} else {
			setErrors(submissionErrors<Input>(result.error.issues, values));
		}
	}

	const resultError = mutation.isSuccess
		? (getResultError?.(mutation.data) ?? null)
		: null;
	let error = resultError;
	if (mutation.isError) error = m.error_generic();
	if (invalid) {
		error = errors.form ? validationMessage(errors.form) : null;
	}

	return {
		onSubmit,
		onChange: () => {
			setInvalid(false);
			setErrors(emptySubmissionErrors);
			if (mutation.isError || mutation.isSuccess) mutation.reset();
		},
		errors: errors.fields,
		error,
		pending: mutation.isPending,
		succeeded: mutation.isSuccess && !resultError,
		success:
			mutation.isSuccess && !resultError && renderSuccess
				? renderSuccess(mutation.data)
				: null,
	};
}

const emptySubmissionErrors = { fields: {}, form: null } as const;

export function validationMessage(reason: SubmissionErrorReason): string {
	switch (reason) {
		case "required":
			return m.validation_required();
		case "too_short":
			return m.validation_too_short();
		case "too_long":
			return m.validation_too_long();
		case "range":
			return m.validation_range();
		case "custom":
			return m.validation_custom();
		default:
			return m.validation_invalid();
	}
}
