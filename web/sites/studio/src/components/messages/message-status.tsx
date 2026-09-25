export function MessageStatus({ status }: { status: string }) {
	return (
		<span
			className={status === "FAILED" ? "status-pill failure" : "status-pill"}
		>
			{status}
		</span>
	);
}
