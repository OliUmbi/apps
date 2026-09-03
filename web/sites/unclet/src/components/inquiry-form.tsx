import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { sendInquiry } from "../inquiry/inquiry.functions";

export function InquiryForm() {
	const submitInquiry = useServerFn(sendInquiry);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [reference, setReference] = useState("");

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setError("");
		const form = new FormData(event.currentTarget);
		try {
			const result = await submitInquiry({
				data: {
					name: String(form.get("name")),
					email: String(form.get("email")),
					phone: String(form.get("phone")),
					date: String(form.get("date")),
					location: String(form.get("location")),
					guests: Number(form.get("guests")),
					note: String(form.get("note")),
				},
			});
			setReference(result.reference);
		} catch {
			setError(
				"Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es nochmals oder schreibe an info@uncle-t.ch.",
			);
		} finally {
			setBusy(false);
		}
	}

	if (reference)
		return (
			<div className="border border-brass/30 bg-brass/8 p-8" role="status">
				<span className="mb-5 grid size-11 place-items-center bg-brass text-night">
					<Check size={20} />
				</span>
				<h2 className="font-serif text-3xl">Anfrage erhalten.</h2>
				<p className="mt-3 max-w-xl leading-relaxed text-bone/65">
					Danke. Thomas meldet sich persönlich, um deinen Anlass zu besprechen.
					Deine Referenz ist <strong className="text-bone">{reference}</strong>.
				</p>
			</div>
		);

	return (
		<form onSubmit={submit} className="grid gap-x-8 gap-y-6 md:grid-cols-2">
			<Field label="Name *">
				<input
					required
					name="name"
					className="field-control"
					placeholder="Vor- und Nachname"
				/>
			</Field>
			<Field label="E-Mail">
				<input
					name="email"
					type="email"
					className="field-control"
					placeholder="name@beispiel.ch"
				/>
			</Field>
			<Field label="Telefon">
				<input
					name="phone"
					type="tel"
					className="field-control"
					placeholder="+41 …"
				/>
			</Field>
			<Field label="Wunschdatum">
				<input name="date" type="date" className="field-control scheme-dark" />
			</Field>
			<Field label="Ort *">
				<input
					required
					name="location"
					className="field-control"
					placeholder="Ort des Anlasses"
				/>
			</Field>
			<Field label="Gäste *">
				<input
					required
					name="guests"
					type="number"
					min="1"
					max="10000"
					className="field-control"
					placeholder="Ungefähre Anzahl"
				/>
			</Field>
			<label className="block md:col-span-2">
				<span className="eyebrow text-bone/45">Deine Idee</span>
				<textarea
					name="note"
					rows={5}
					maxLength={3000}
					className="field-control resize-y"
					placeholder="Was möchtest du feiern? Was ist dir wichtig?"
				/>
			</label>
			<div className="md:col-span-2">
				{error ? (
					<p className="mb-4 text-sm text-red-300" role="alert">
						{error}
					</p>
				) : null}
				<button
					disabled={busy}
					type="submit"
					className="button-primary disabled:cursor-wait disabled:opacity-55"
				>
					{busy ? (
						"Wird gesendet …"
					) : (
						<>
							Anfrage senden <ArrowRight size={17} />
						</>
					)}
				</button>
				<p className="mt-4 max-w-xl text-xs leading-relaxed text-bone/40">
					E-Mail oder Telefonnummer genügt. Deine Angaben werden nur zur
					Bearbeitung dieser Anfrage verwendet.
				</p>
			</div>
		</form>
	);
}

function Field({
	label,
	children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
	return (
		<label className="block">
			<span className="eyebrow text-bone/45">{label}</span>
			{children}
		</label>
	);
}
