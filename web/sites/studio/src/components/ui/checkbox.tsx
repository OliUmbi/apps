import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

/*
 * The only checkbox. Checked is an inverted neutral, same as the primary
 * button, so teal stays reserved for focus and links.
 */
export function Checkbox({
	name,
	label,
	checked,
	onChange,
}: {
	name?: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2.5 text-sm">
			<BaseCheckbox.Root
				name={name}
				checked={checked}
				onCheckedChange={(next) => onChange(Boolean(next))}
				className="grid size-5 shrink-0 place-items-center rounded-control border border-line bg-field data-checked:border-transparent data-checked:bg-fg"
			>
				<BaseCheckbox.Indicator>
					<Check size={13} strokeWidth={3} className="text-canvas" />
				</BaseCheckbox.Indicator>
			</BaseCheckbox.Root>
			<span className="text-fg-muted">{label}</span>
		</label>
	);
}
