import { m } from "@oliumbi/i18n/messages";
import type { ComponentProps } from "react";
import { Checkbox } from "../ui/checkbox";
import { FieldLabel, FieldMessage, FieldRoot } from "../ui/field";
import {
	SelectItem,
	SelectPanel,
	SelectRoot,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { TextField } from "../ui/text-field";
import { displayStatus } from "./display";

export function CheckboxField({
	name,
	label,
	value,
	onChange,
}: {
	name: string;
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<Checkbox name={name} label={label} checked={value} onChange={onChange} />
	);
}

export function NumberField({
	value,
	onChange,
	nullable = false,
	...props
}: Omit<ComponentProps<typeof TextField>, "value" | "onChange" | "type"> & {
	value: number | null;
	onChange: (value: number | null) => void;
	nullable?: boolean;
}) {
	return (
		<TextField
			{...props}
			type="number"
			value={value === null || Number.isNaN(value) ? "" : value}
			onChange={(event) => {
				const input = event.target.value;
				onChange(input === "" ? (nullable ? null : Number.NaN) : Number(input));
			}}
		/>
	);
}

// Renders one workflow's own status vocabulary: each caller passes the states
// its workflow owns, so adding a state to one workflow never widens another
// workflow's editor (plan decision D4).
export function StatusField<Status extends string>({
	statuses,
	value,
	onChange,
}: {
	statuses: readonly Status[];
	value: Status;
	onChange: (value: Status) => void;
}) {
	return (
		<FieldRoot>
			<FieldLabel>{m.status()}</FieldLabel>
			<SelectRoot
				value={value}
				onValueChange={(next) => {
					const status = statuses.find((candidate) => candidate === next);
					if (status) onChange(status);
				}}
			>
				<SelectTrigger>
					<SelectValue>{displayStatus(value)}</SelectValue>
				</SelectTrigger>
				<SelectPanel>
					{statuses.map((status) => (
						<SelectItem
							key={status}
							value={status}
							label={displayStatus(status)}
						/>
					))}
				</SelectPanel>
			</SelectRoot>
			<FieldMessage />
		</FieldRoot>
	);
}
