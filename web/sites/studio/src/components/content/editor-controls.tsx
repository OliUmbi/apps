import { statusValues } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import type { ComponentProps } from "react";
import { InputField } from "../input-field";
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
		<label className="flex items-center gap-3">
			<input
				type="checkbox"
				name={name}
				checked={value}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span>{label}</span>
		</label>
	);
}

export function NumberField({
	value,
	onChange,
	nullable = false,
	...props
}: Omit<ComponentProps<typeof InputField>, "value" | "onChange" | "type"> & {
	value: number | null;
	onChange: (value: number | null) => void;
	nullable?: boolean;
}) {
	return (
		<InputField
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
		<label className="grid gap-2">
			<span>{m.status()}</span>
			<select
				name="status"
				className="rounded-lg border border-white/20 bg-zinc-950 p-3"
				value={value}
				onChange={(event) => {
					const status = statusValues.find(
						(candidate) => candidate === event.target.value,
					);
					if (status) onChange(status);
				}}
			>
				{statusValues.map((status) => (
					<option key={status} value={status}>
						{displayStatus(status)}
					</option>
				))}
			</select>
		</label>
	);
}
