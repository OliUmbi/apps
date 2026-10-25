import type { CSSProperties, ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

/*
 * The calendar surface. react-day-picker is themed through its own custom
 * properties rather than a stylesheet override, so the whole look lives here
 * and tracks the tokens instead of copying their values.
 */

const theme = {
	"--rdp-accent-color": "var(--color-canvas)",
	"--rdp-accent-background-color": "var(--color-fg)",
	"--rdp-background-color": "var(--color-layer-3)",
	"--rdp-color": "var(--color-fg)",
	"--rdp-outline": "2px solid var(--color-interactive)",
	"--rdp-disabled-color": "var(--color-fg-disabled)",
	"--rdp-day-width": "32px",
	"--rdp-day-height": "32px",
	"--rdp-nav-button-width": "30px",
	"--rdp-nav-button-height": "30px",
} as CSSProperties;

export function Calendar(props: ComponentProps<typeof DayPicker>) {
	return (
		<div className="p-2 text-sm" style={theme}>
			<DayPicker {...props} />
		</div>
	);
}
