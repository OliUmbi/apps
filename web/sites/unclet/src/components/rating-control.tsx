import { Field } from "@base-ui/react/field";
import { m } from "@oliumbi/i18n/messages";
import { Star } from "lucide-react";
import { useState } from "react";
import type { SubmissionField } from "./submission-control";

export function RatingControl({
	field,
	disabled,
}: {
	field: SubmissionField;
	disabled: boolean;
}) {
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
								disabled={disabled}
								onChange={() => setRating(value)}
								aria-label={m.star_rating({ rating: value, maximum })}
							/>
							<Star size={30} strokeWidth={1.4} aria-hidden="true" />
						</label>
					),
				)}
			</div>
		</Field.Root>
	);
}
