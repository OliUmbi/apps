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
				className="rounded-lg border border-emerald-500/30 p-3 text-sm"
			>
				{success}
			</p>
		);
	return null;
}
