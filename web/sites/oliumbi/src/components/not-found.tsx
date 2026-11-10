import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="text-center">
			<p className="text-sm tracking-[0.2em] text-neutral-500">ERR / 404</p>
			<h1 className="mt-3 text-4xl font-semibold tracking-tight">
				Page not found
			</h1>
			<p className="mt-4 text-neutral-600">
				The page you were looking for does not exist.
			</p>
			<Link className="mt-6 inline-block underline" to="/">
				Back to home
			</Link>
		</div>
	);
}
