import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import type { z } from "zod";

export function useSubmissionForm<Input, Result>({
	schema,
	submit,
	getResultError,
	numberFields = [],
	defaults = {},
}: {
	schema: z.ZodType<Input>;
	submit: (data: Input) => Promise<Result>;
	getResultError?: (result: Result) => string | null;
	numberFields?: readonly string[];
	defaults?: Record<string, unknown>;
}) {
	const [invalid, setInvalid] = useState(false);
	const mutation = useMutation({ mutationFn: submit });

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) return;
		const values = readFormValues(
			new FormData(event.currentTarget),
			defaults,
			numberFields,
		);
		const result = schema.safeParse(values);
		setInvalid(!result.success);
		if (result.success) mutation.mutate(result.data);
	}

	const resultError = mutation.isSuccess
		? (getResultError?.(mutation.data) ?? null)
		: null;
	let error = resultError;
	if (mutation.isError) error = m.error_generic();
	if (invalid) error = m.required();

	return {
		onSubmit,
		onChange: () => {
			setInvalid(false);
			if (mutation.isError || mutation.isSuccess) mutation.reset();
		},
		error,
		pending: mutation.isPending,
		succeeded: mutation.isSuccess && !resultError,
	};
}

function readFormValues(
	form: FormData,
	defaults: Record<string, unknown>,
	numberFields: readonly string[],
) {
	const values: Record<string, unknown> = {
		...defaults,
		...Object.fromEntries(form),
	};
	for (const name of numberFields) values[name] = Number(values[name]);
	return values;
}
