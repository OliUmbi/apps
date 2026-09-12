import { Popover } from "@base-ui/react/popover";
import type { RecordValue, ResourceField } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { format, isValid, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Field } from "./ui/index";

export function DateField({
	field,
	value,
	onChange,
}: {
	field: ResourceField;
	value: RecordValue;
	onChange: (value: RecordValue) => void;
}) {
	const date = value ? parseISO(String(value)) : undefined;
	const selected = date && isValid(date) ? date : undefined;
	const hasTime = field.kind === "datetime-local";
	const label = selected
		? format(selected, hasTime ? "dd. MMMM yyyy, HH:mm" : "dd. MMMM yyyy", {
				locale: de,
			})
		: m.studio_date_choose();

	const selectDate = (next: Date | undefined) => {
		if (!next) {
			if (field.nullable) onChange(null);
			return;
		}
		if (!hasTime) {
			onChange(format(next, "yyyy-MM-dd"));
			return;
		}
		const combined = new Date(next);
		combined.setHours(
			selected?.getHours() ?? 9,
			selected?.getMinutes() ?? 0,
			0,
			0,
		);
		onChange(combined.toISOString());
	};

	const selectTime = (time: string) => {
		if (!time) return;
		const [hours, minutes] = time.split(":").map(Number);
		const combined = selected ? new Date(selected) : new Date();
		combined.setHours(hours, minutes, 0, 0);
		onChange(combined.toISOString());
	};

	return (
		<Field.Root name={field.name} className="grid gap-2 text-sm">
			<Field.Label className="font-medium">{field.label}</Field.Label>
			<div className={hasTime ? "date-control has-time" : "date-control"}>
				<Popover.Root>
					<Popover.Trigger className="date-trigger">
						<CalendarDays size={17} />
						<span>{label}</span>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner sideOffset={8} className="z-80">
							<Popover.Popup className="calendar-popup">
								<DayPicker
									mode="single"
									selected={selected}
									onSelect={selectDate}
									locale={de}
									showOutsideDays
								/>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
				{hasTime && (
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
