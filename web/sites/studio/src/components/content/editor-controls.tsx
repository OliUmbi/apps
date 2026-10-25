import { statusValues } from "@oliumbi/contracts";
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

export function StatusField({
	value,
	onChange,
}: {
	value: (typeof statusValues)[number];
	onChange: (value: (typeof statusValues)[number]) => void;
}) {
	return (
		<FieldRoot>
			<FieldLabel>{m.status()}</FieldLabel>
			<SelectRoot
				value={value}
				onValueChange={(next) => {
					const status = statusValues.find((candidate) => candidate === next);
					if (status) onChange(status);
				}}
			>
				<SelectTrigger>
					<SelectValue>{displayStatus(value)}</SelectValue>
				</SelectTrigger>
				<SelectPanel>
					{statusValues.map((status) => (
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
