import { Field } from "@base-ui/react/field";
import { m } from "@oliumbi/i18n/messages";
import type {
	SubmissionErrorReason,
	SubmissionField,
} from "@oliumbi/ui/submission-types";
import { validationMessage } from "@oliumbi/ui/use-submission-form";
import { Star } from "lucide-react";
import { useState } from "react";

export function RatingControl<Input>({
	field,
	label,
	error,
	disabled,
}: {
	field: Extract<SubmissionField<Input>, { kind: "rating" }>;
	label: string;
	error?: SubmissionErrorReason;
	disabled: boolean;
}) {
	const maximum = field.max ?? 5;
	const [rating, setRating] = useState<number | null>(null);
	return (
		<Field.Root name={field.name} className="grid gap-3">
			<Field.Label className="font-medium">{label}</Field.Label>
			<div
				className="rating-control"
				role="radiogroup"
				aria-label={label}
				aria-invalid={error ? true : undefined}
			>
				{Array.from({ length: maximum }, (_, index) => index + 1).map(
					(value) => (
						<label
							key={value}
							className={
								rating !== null && value <= rating ? "is-active" : undefined
							}
						>
							<input
								type="radio"
								name={field.name}
								value={value}
								checked={rating === value}
								disabled={disabled}
								required={field.required && value === 1}
								onChange={() => setRating(value)}
								aria-label={m.star_rating({ rating: value, maximum })}
							/>
							<Star size={30} strokeWidth={1.4} aria-hidden="true" />
						</label>
					),
				)}
			</div>
			<Field.Error match={error !== undefined} className="text-danger">
				{error ? validationMessage(error) : null}
			</Field.Error>
		</Field.Root>
	);
}
