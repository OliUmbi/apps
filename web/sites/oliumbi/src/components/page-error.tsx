import { useRouter } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	return (
		<div className="text-center">
			<p className="text-sm tracking-[0.2em] text-neutral-500">ERR / 500</p>
			<h1 className="mt-3 text-4xl font-semibold tracking-tight">
				Something went wrong
			</h1>
			<p className="mt-4 text-neutral-600">
				The page could not be loaded. Please try again.
			</p>
			<button
				className="mt-6 underline"
				type="button"
				onClick={() => void router.invalidate()}
			>
				Try again
			</button>
		</div>
	);
}
