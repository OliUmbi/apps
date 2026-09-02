import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { unsubscribeFromNewsletter } from "../../../newsletter/newsletter.functions";

export const Route = createFileRoute("/newsletter/abmelden/$token")({
	component: UnsubscribePage,
});

function UnsubscribePage() {
	const { token } = Route.useParams();
	const unsubscribe = useServerFn(unsubscribeFromNewsletter);
	const [result, setResult] = useState<string>();

	async function submit() {
		try {
			const response = await unsubscribe({ data: { token } });
			setResult(response.outcome);
		} catch {
			setResult("error");
		}
	}

	const done = result === "unsubscribed" || result === "already-unsubscribed";
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="font-serif text-4xl font-bold">Newsletter abbestellen</h1>
			{result ? (
				<p className="mt-6" role="status">
					{done
						? "Du erhältst keine weiteren Newsletter."
						: "Dieser Abmeldelink ist ungültig."}
				</p>
			) : (
				<>
					<p className="mt-4 text-stone-600">
						Du kannst dich mit einem Klick kostenlos abmelden.
					</p>
					<button
						className="mt-8 rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white"
						onClick={submit}
						type="button"
					>
						Newsletter abbestellen
					</button>
				</>
			)}
		</section>
	);
}
