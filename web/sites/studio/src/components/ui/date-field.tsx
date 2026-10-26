import { m } from "@oliumbi/i18n/messages";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useId } from "react";
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
		if (!time) return;
		onChange(changeDateInputTime(time, selected));
	};

	return (
		<FieldRoot name={name}>
			<div className="flex items-start gap-4 max-md:flex-col">
				<div className="grid flex-1 gap-1.5">
					<FieldLabel htmlFor={controlId}>{label}</FieldLabel>
					<PopoverRoot>
						<PopoverTrigger id={controlId}>
							<CalendarDays size={17} aria-hidden="true" />
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
							type="time"
							className="w-32"
							value={selected ? format(selected, "HH:mm") : "09:00"}
							onChange={(event) => selectTime(event.target.value)}
						/>
					</div>
				)}
			</div>
			<FieldMessage />
		</FieldRoot>
	);
}
