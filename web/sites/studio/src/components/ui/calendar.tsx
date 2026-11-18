import type { ComponentProps, CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./calendar.css";

/* Day Picker owns its calendar variables; the scoped stylesheet supplies the
 * state treatments that its variables alone cannot express. */
const theme = {
	"--rdp-accent-color": "var(--color-fg)",
	"--rdp-accent-background-color": "var(--color-layer-2)",
	"--rdp-color": "var(--color-fg)",
	"--rdp-outline": "2px solid var(--color-interactive)",
	"--rdp-disabled-color": "var(--color-fg-disabled)",
	"--rdp-day-width": "40px",
	"--rdp-day-height": "40px",
	"--rdp-day_button-width": "36px",
	"--rdp-day_button-height": "36px",
	"--rdp-day_button-border-radius": "var(--radius-control)",
	"--rdp-day_button-border": "1px solid transparent",
	"--rdp-selected-border": "1px solid var(--color-fg)",
	"--rdp-nav-button-width": "36px",
	"--rdp-nav-button-height": "36px",
	"--rdp-nav-height": "40px",
	"--rdp-outside-opacity": "0.45",
	"--rdp-weekday-opacity": "1",
} as CSSProperties;

export function Calendar(props: ComponentProps<typeof DayPicker>) {
	return (
		<div className="p-3 text-sm">
			<DayPicker {...props} className="studio-calendar" style={theme} />
		</div>
	);
}
