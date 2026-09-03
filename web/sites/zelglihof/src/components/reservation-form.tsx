import { useServerFn } from "@tanstack/react-start";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "../content/site-content";
import { createReservation } from "../shop/reservation.functions";

export function ReservationForm({ product }: { product: Product }) {
	const submitReservation = useServerFn(createReservation);
	const [quantity, setQuantity] = useState(1);
	const [state, setState] = useState<
		| { kind: "idle" | "sending" | "error" | "unavailable" }
		| { kind: "sent"; reference: string }
	>({ kind: "idle" });

	async function submit(formData: FormData) {
		setState({ kind: "sending" });
		try {
			const result = await submitReservation({
				data: {
					productId: product.id,
					variantId: String(formData.get("variantId") ?? ""),
					name: String(formData.get("name") ?? ""),
					email: String(formData.get("email") ?? ""),
					phone: String(formData.get("phone") ?? ""),
					quantity,
					note: String(formData.get("note") ?? ""),
				},
			});
			setState(
				result.outcome === "reserved"
					? { kind: "sent", reference: result.reference }
					: { kind: "unavailable" },
			);
		} catch {
			setState({ kind: "error" });
		}
	}

	if (state.kind === "sent")
		return (
			<div className="rounded-[1.5rem] bg-forest p-7 text-cream" role="status">
				<span className="grid size-12 place-items-center rounded-full bg-sun text-ink">
					<Check />
				</span>
				<h2 className="mt-6 font-serif text-3xl font-bold">
					Für dich vorgemerkt.
				</h2>
				<p className="mt-3 text-cream/72">
					Deine Referenz lautet{" "}
					<strong className="text-cream">{state.reference}</strong>. Wir melden
					uns mit den Abholdetails.
				</p>
			</div>
		);

	return (
		<form
			action={submit}
			className="grid gap-5 rounded-[1.5rem] bg-cream p-6 md:p-8"
		>
			<div>
				<p className="eyebrow text-clay">Unverbindlich reservieren</p>
				<h2 className="mt-4 font-serif text-3xl font-bold">
					Was dürfen wir bereitlegen?
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-ink/55">
					Keine Online-Zahlung. Wir bestätigen dir Abholtermin und Details
					persönlich.
				</p>
			</div>
			<label className="field-label">
				Auswahl
				<select className="field-control" name="variantId" required>
					{product.variants.map((variant) => (
						<option key={variant.id} value={variant.id}>
							{variant.name}
						</option>
					))}
				</select>
			</label>
			<label className="field-label">
				Name
				<input
					className="field-control"
					name="name"
					autoComplete="name"
					placeholder="Vor- und Nachname"
					required
					minLength={2}
					maxLength={120}
				/>
			</label>
			<div className="grid gap-5 sm:grid-cols-2">
				<label className="field-label">
					E-Mail <span className="font-normal text-ink/45">oder Telefon</span>
					<input
						className="field-control"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="name@beispiel.ch"
						maxLength={320}
					/>
				</label>
				<label className="field-label">
					Telefon <span className="font-normal text-ink/45">oder E-Mail</span>
					<input
						className="field-control"
						name="phone"
						type="tel"
						autoComplete="tel"
						placeholder="079 000 00 00"
						maxLength={40}
					/>
				</label>
			</div>
			<div className="field-label">
				Menge
				<div className="flex w-fit items-center overflow-hidden rounded-full border border-forest/20 bg-oat">
					<button
						type="button"
						className="grid size-11 place-items-center hover:bg-sage/30"
						onClick={() => setQuantity((value) => Math.max(1, value - 1))}
						aria-label="Menge verringern"
					>
						<Minus size={17} />
					</button>
					<output className="w-12 text-center font-bold" aria-live="polite">
						{quantity}
					</output>
					<button
						type="button"
						className="grid size-11 place-items-center hover:bg-sage/30"
						onClick={() => setQuantity((value) => Math.min(20, value + 1))}
						aria-label="Menge erhöhen"
					>
						<Plus size={17} />
					</button>
				</div>
			</div>
			<label className="field-label">
				Notiz <span className="font-normal text-ink/45">optional</span>
				<textarea
					className="field-control min-h-24 resize-y"
					name="note"
					placeholder="Wunsch, Frage oder bevorzugte Kontaktzeit"
					maxLength={1000}
				/>
			</label>
			{state.kind === "error" && (
				<p className="rounded-xl bg-clay/10 p-3 text-sm text-clay" role="alert">
					Die Reservation konnte nicht gespeichert werden. Bitte prüfe deine
					Angaben.
				</p>
			)}
			{state.kind === "unavailable" && (
				<p className="rounded-xl bg-sun/25 p-3 text-sm" role="alert">
					Diese Auswahl ist gerade nicht mehr in der gewünschten Menge
					verfügbar.
				</p>
			)}
			<button
				type="submit"
				className="button-primary w-full disabled:opacity-50"
				disabled={state.kind === "sending"}
			>
				{state.kind === "sending"
					? "Wird reserviert …"
					: "Reservation absenden"}
			</button>
			<p className="text-xs leading-relaxed text-ink/45">
				Mit dem Absenden stimmst du zu, dass wir deine Angaben zur Bearbeitung
				der Reservation verwenden.
			</p>
		</form>
	);
}
