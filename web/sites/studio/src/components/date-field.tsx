import { Popover } from "@base-ui/react/popover";
import { m } from "@oliumbi/i18n/messages";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useId } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Field } from "@base-ui/react/field";
import {
	changeDateInputDay,
	changeDateInputTime,
	parseDateInput,
} from "../model/date-input";
import { studioTimeZone } from "../model/dates";

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
		<Field.Root name={name} className="grid gap-2 text-sm">
			<Field.Label htmlFor={controlId} className="font-medium">
				{label}
			</Field.Label>
			<div className={includeTime ? "date-control has-time" : "date-control"}>
				<Popover.Root>
					<Popover.Trigger id={controlId} className="date-trigger">
						<CalendarDays size={17} />
						<span>{displayLabel}</span>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner sideOffset={8} className="z-80">
							<Popover.Popup className="calendar-popup">
								<DayPicker
									mode="single"
									timeZone={studioTimeZone}
									selected={selected}
									defaultMonth={selected}
									onSelect={selectDate}
									locale={de}
									showOutsideDays
								/>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
				{includeTime && (
					<label className="time-control">
						<span>{m.studio_time()}</span>
						<input
							type="time"
							value={selected ? format(selected, "HH:mm") : "09:00"}
							onChange={(event) => selectTime(event.target.value)}
						/>
					</label>
				)}
			</div>
		</Field.Root>
	);
}
