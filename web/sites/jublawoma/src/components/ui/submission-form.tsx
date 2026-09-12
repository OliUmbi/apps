import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { Select } from "@base-ui/react/select";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { z } from "zod";
import { FormFeedback } from "./form-feedback";
import { InputField } from "./input-field";

export interface SubmissionField {
	name: string;
	label: string;
	type?: "text" | "email" | "tel" | "date" | "number" | "textarea";
	required?: boolean;
	min?: number;
	max?: number;
	step?: number;
	options?: { value: string; label: string }[];
}

export function SubmissionForm<T, R extends { outcome: string }>({
	schema,
	fields,
	submit,
	defaults = {},
	success = m.sent(),
	submitLabel = m.submit(),
	className = "",
}: {
	schema: z.ZodType<T>;
	fields: SubmissionField[];
	submit: (data: T) => Promise<R>;
	defaults?: Record<string, unknown>;
	success?: string;
	submitLabel?: string;
	className?: string;
}) {
	const [validation, setValidation] = useState("");
	const mutation = useMutation({ mutationFn: submit });
	if (mutation.isSuccess && mutation.data.outcome !== "unavailable")
		return <FormFeedback success={success} />;
	return (
		<Form
			className={`grid gap-5 ${className}`}
			onSubmit={(event) => {
				event.preventDefault();
				const values: Record<string, unknown> = {
					...defaults,
					...Object.fromEntries(new FormData(event.currentTarget)),
				};
				for (const field of fields)
					if (field.type === "number")
						values[field.name] = Number(values[field.name]);
				const result = schema.safeParse(values);
				if (!result.success) {
					setValidation(m.required());
					return;
				}
				setValidation("");
				mutation.mutate(result.data);
			}}
		>
			{fields.map((field) => (
				<SubmissionControl key={field.name} field={field} />
			))}
			<FormFeedback
				error={
					validation ||
					(mutation.isError
						? m.error_generic()
						: mutation.data?.outcome === "unavailable"
							? m.unavailable()
							: null)
				}
			/>
			<Button
				type="submit"
				className="button dark disabled:opacity-50"
				disabled={mutation.isPending}
			>
				{mutation.isPending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}

function SubmissionControl({ field }: { field: SubmissionField }) {
	if (field.options)
		return (
			<Field.Root name={field.name} className="grid gap-2">
				<Field.Label>{field.label}</Field.Label>
				<Select.Root
					name={field.name}
					defaultValue={field.options[0]?.value}
					required={field.required}
				>
					<Select.Trigger className="rounded-lg border border-current/20 px-3 py-2 text-left">
						<Select.Value />
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner className="z-70">
							<Select.Popup className="rounded-xl border border-current/20 bg-stone-100 p-2 text-stone-900 shadow-xl">
								{field.options.map((option) => (
									<Select.Item
										key={option.value}
										value={option.value}
										className="rounded p-3 data-highlighted:bg-stone-200"
									>
										<Select.ItemText>{option.label}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
			</Field.Root>
		);
	return (
		<InputField
			name={field.name}
			label={field.label}
			type={field.type === "textarea" ? undefined : (field.type ?? "text")}
			render={field.type === "textarea" ? <textarea rows={5} /> : undefined}
			required={field.required}
			min={field.min}
			max={field.max}
			step={field.step}
			defaultValue={field.type === "number" ? (field.min ?? 1) : undefined}
		/>
	);
}
