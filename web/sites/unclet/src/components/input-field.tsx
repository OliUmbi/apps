import { Field } from "@base-ui/react/field";
import type { SubmissionErrorReason } from "@oliumbi/ui/submission-types";
import { validationMessage } from "@oliumbi/ui/use-submission-form";
import type { ComponentProps } from "react";

export function InputField({
	label,
	name,
	error,
	className,
	...props
}: ComponentProps<typeof Field.Control> & {
	label: string;
	name: string;
	error?: SubmissionErrorReason;
}) {
	return (
		<Field.Root name={name} className="grid gap-2 text-sm">
			<Field.Label className="font-medium">{label}</Field.Label>
			<Field.Control
				{...props}
				aria-invalid={error ? true : undefined}
				className={(state) =>
					`min-h-12 w-full border border-bone/20 bg-night/45 px-4 py-3 transition placeholder:text-bone/30 focus:border-brass focus:bg-night/70 focus:outline-2 focus:outline-offset-2 disabled:opacity-50 ${(typeof className === "function" ? className(state) : className) ?? ""}`
				}
			/>
			<Field.Error match={error !== undefined} className="text-danger">
				{error ? validationMessage(error) : null}
			</Field.Error>
		</Field.Root>
	);
}
