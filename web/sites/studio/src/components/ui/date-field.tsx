import { m } from "@oliumbi/i18n/messages";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";
import {
	changeDateInputDay,
	changeDateInputTime,
	parseDateInput,
} from "../../model/date-input";
import { studioTimeZone } from "../../model/dates";
import { Calendar } from "./calendar";
import { FieldInput, FieldLabel, FieldMessage, FieldRoot } from "./field";
import { PopoverPanel, PopoverRoot, PopoverTrigger } from "./popover";

export function DateField({
	name,
	label,
	includeTime = false,
	nullable = false,
	value,
	onChange,
}: {
	name: string;
	label: string;
	includeTime?: boolean;
	nullable?: boolean;
	value: string | null;
	onChange: (value: string | null) => void;
}) {
	const controlId = useId();
	const timeId = useId();
	const selected = parseDateInput(value, includeTime);
	const [timeDraft, setTimeDraft] = useState(() =>
		selected ? format(selected, "HH:mm") : "09:00",
	);
	const displayLabel = selected
		? format(selected, includeTime ? "dd. MMMM yyyy, HH:mm" : "dd. MMMM yyyy", {
				locale: de,
			})
		: m.studio_date_choose();

	const selectDate = (next: Date | undefined) => {
		if (!next) {
			if (nullable) onChange(null);
			return;
		}
		onChange(changeDateInputDay(next, includeTime, selected));
	};

	const selectTime = (time: string) => {
		setTimeDraft(time);
		if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
		onChange(changeDateInputTime(time, selected));
	};

	return (
		<FieldRoot name={name}>
			<div className="flex items-start gap-4 max-md:flex-col">
				<div className="grid flex-1 gap-1.5">
					<FieldLabel htmlFor={controlId}>{label}</FieldLabel>
					<PopoverRoot>
						<PopoverTrigger id={controlId}>
							<CalendarDays
								size={17}
								className="shrink-0 text-fg-subtle"
								aria-hidden="true"
							/>
							<span className="truncate">{displayLabel}</span>
						</PopoverTrigger>
						<PopoverPanel>
							<Calendar
								mode="single"
								timeZone={studioTimeZone}
								selected={selected}
								defaultMonth={selected}
								onSelect={selectDate}
								locale={de}
								showOutsideDays
							/>
						</PopoverPanel>
					</PopoverRoot>
				</div>
				{includeTime && (
					<div className="grid flex-none gap-1.5">
						<FieldLabel htmlFor={timeId}>{m.studio_time()}</FieldLabel>
						<FieldInput
							id={timeId}
							type="text"
							inputMode="numeric"
							pattern="(?:[01]\\d|2[0-3]):[0-5]\\d"
							maxLength={5}
							placeholder="09:00"
							className="w-28 text-center font-mono tabular-nums"
							value={timeDraft}
							onChange={(event) => selectTime(event.target.value)}
						/>
					</div>
				)}
			</div>
			<FieldMessage />
		</FieldRoot>
	);
}
