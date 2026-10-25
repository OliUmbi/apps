/*
 * @deprecated reserved-space feedback lives in `@oliumbi/ui/alert`: `Alert`
 * always occupies its 40px slot, so state changes never move anything, while
 * this component mounts and unmounts around its message. Kept compiling for the
 * remaining call sites; retirement belongs to the studio and site lanes. The
 * success tone reads the `success` theme token (`--color-success`, defined per
 * site) instead of a hardcoded palette entry.
 */
export function FormFeedback({
	error,
	success,
}: {
	error?: string | null;
	success?: string | null;
}) {
	if (error)
		return (
			<p
				role="alert"
				className="rounded-lg border border-danger/30 p-3 text-sm text-danger"
			>
				{error}
			</p>
		);
	if (success)
		return (
			<p
				role="status"
				className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success"
			>
				{success}
			</p>
		);
	return null;
}
