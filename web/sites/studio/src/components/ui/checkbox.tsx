import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";

/*
 * The only checkbox. Checked is an inverted neutral, same as the primary
 * button, so teal stays reserved for focus and links.
 *
 * Base UI renders the root as a `span[role=checkbox]` beside a hidden input,
 * not as a labelable control: the label is wired through `aria-labelledby`, and
 * a `<label>` wrapper would associate nothing. The root also exposes its state
 * as `data-*` attributes rather than a native `disabled`, which is what the
 * disabled styling below keys on.
 */
export function Checkbox({
	name,
	label,
	description,
	checked,
	onChange,
	disabled,
}: {
	name?: string;
	label: string;
	description?: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}) {
	const labelId = useId();
	const descriptionId = useId();
	return (
		<div className="flex items-center gap-2.5 text-sm">
			<BaseCheckbox.Root
				name={name}
				checked={checked}
				disabled={disabled}
				onCheckedChange={(next) => onChange(Boolean(next))}
				aria-labelledby={labelId}
				aria-describedby={description ? descriptionId : undefined}
				className="grid size-5 shrink-0 place-items-center rounded-control border border-line bg-field data-checked:border-transparent data-checked:bg-fg data-disabled:cursor-not-allowed data-disabled:opacity-50"
			>
				<BaseCheckbox.Indicator>
					<Check size={13} strokeWidth={3} className="text-canvas" />
				</BaseCheckbox.Indicator>
			</BaseCheckbox.Root>
			<span className="grid gap-1">
				<span id={labelId} className="text-fg-muted">
					{label}
				</span>
				{description ? (
					<span id={descriptionId} className="font-mono text-xs text-fg-subtle">
						{description}
					</span>
				) : null}
			</span>
		</div>
	);
}
