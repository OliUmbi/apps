import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { Select } from "@base-ui/react/select";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { FormFeedback } from "./form-feedback";
import { InputField } from "./input-field";

export interface SubmissionField {
	name: string;
	label: string;
	type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "rating";
	required?: boolean;
	min?: number;
	step?: number;
	max?: number;
	placeholder?: string;
	autoComplete?: string;
	wide?: boolean;
	options?: { value: string; label: string }[];
}

export function SubmissionForm<T, R extends { outcome: string }>({
	schema,
	fields,
	submit,
	defaults = {},
	success = m.sent(),
	className = "",
	submitLabel = m.submit(),
}: {
	schema: z.ZodType<T>;
	fields: SubmissionField[];
	submit: (data: T) => Promise<R>;
	defaults?: Record<string, unknown>;
	success?: string;
	className?: string;
	submitLabel?: string;
}) {
	const [validation, setValidation] = useState("");
	const mutation = useMutation({ mutationFn: submit });
	if (mutation.isSuccess && mutation.data.outcome !== "unavailable")
		return <FormFeedback success={success} />;
	return (
		<Form
			className={`submission-form grid gap-5 ${className}`}
			onSubmit={(event) => {
				event.preventDefault();
				const values: Record<string, unknown> = {
					...defaults,
					...Object.fromEntries(new FormData(event.currentTarget)),
				};
				for (const field of fields)
					if (field.type === "number" || field.type === "rating")
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
				<div
					key={field.name}
					className={`form-control-wrap ${field.wide ? "is-wide" : ""}`}
				>
					<SubmissionControl field={field} />
				</div>
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
				className="button-primary disabled:opacity-50"
				disabled={mutation.isPending}
			>
				{mutation.isPending ? m.saving() : submitLabel}
			</Button>
		</Form>
	);
}

function SubmissionControl({ field }: { field: SubmissionField }) {
	if (field.type === "rating") return <RatingControl field={field} />;
	if (field.options)
		return (
			<Field.Root name={field.name} className="grid gap-2">
				<Field.Label>{field.label}</Field.Label>
				<Select.Root
					name={field.name}
					items={field.options}
					defaultValue={field.options[0]?.value}
					required={field.required}
				>
					<Select.Trigger className="flex min-h-12 items-center justify-between border border-bone/20 bg-coal px-4 text-left">
						<Select.Value />
						<ChevronDown size={17} aria-hidden="true" />
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
			placeholder={field.placeholder}
			autoComplete={field.autoComplete}
			defaultValue={field.type === "number" ? (field.min ?? 1) : undefined}
		/>
	);
}

function RatingControl({ field }: { field: SubmissionField }) {
	const maximum = field.max ?? 5;
	const [rating, setRating] = useState(maximum);
	return (
		<Field.Root name={field.name} className="grid gap-3">
			<Field.Label className="font-medium">{field.label}</Field.Label>
			<div
				className="rating-control"
				role="radiogroup"
				aria-label={field.label}
			>
				{Array.from({ length: maximum }, (_, index) => index + 1).map(
					(value) => (
						<label
							key={value}
							className={value <= rating ? "is-active" : undefined}
						>
							<input
								type="radio"
								name={field.name}
								value={value}
								checked={rating === value}
								onChange={() => setRating(value)}
								aria-label={`${value} von ${maximum} Sternen`}
							/>
							<Star size={30} strokeWidth={1.4} aria-hidden="true" />
						</label>
					),
				)}
			</div>
		</Field.Root>
	);
}
