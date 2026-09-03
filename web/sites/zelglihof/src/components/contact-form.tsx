import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useState } from "react";
import { sendContactInquiry } from "../contact/contact.functions";

export function ContactForm() {
	const send = useServerFn(sendContactInquiry);
	const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
		"idle",
	);
	async function submit(formData: FormData) {
		setState("sending");
		try {
			await send({
				data: {
					name: String(formData.get("name") ?? ""),
					email: String(formData.get("email") ?? ""),
					phone: String(formData.get("phone") ?? ""),
					subject: String(formData.get("subject") ?? "other") as
						| "hofladen"
						| "reservation"
						| "hof"
						| "other",
					message: String(formData.get("message") ?? ""),
				},
			});
			setState("sent");
		} catch {
			setState("error");
		}
	}
	if (state === "sent")
		return (
			<div className="rounded-[1.5rem] bg-sun p-7" role="status">
				<span className="grid size-12 place-items-center rounded-full bg-forest text-cream">
					<Check />
				</span>
				<h2 className="mt-6 font-serif text-3xl font-bold">
					Nachricht angekommen.
				</h2>
				<p className="mt-3 text-ink/65">
					Danke für deine Anfrage. Wir melden uns persönlich bei dir.
				</p>
			</div>
		);
	return (
		<form
			action={submit}
			className="grid gap-5 rounded-[1.5rem] bg-cream p-6 md:p-8"
		>
			<div>
				<p className="eyebrow text-clay">Schreib uns</p>
				<h2 className="mt-4 font-serif text-3xl font-bold">Worum geht es?</h2>
			</div>
			<label className="field-label">
				Thema
				<select
					className="field-control"
					name="subject"
					defaultValue="hofladen"
				>
					<option value="hofladen">Hofladen und Produkte</option>
					<option value="reservation">Bestehende Reservation</option>
					<option value="hof">Frage zum Hof</option>
					<option value="other">Etwas anderes</option>
				</select>
			</label>
			<label className="field-label">
				Name
				<input
					className="field-control"
					name="name"
					autoComplete="name"
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
					/>
				</label>
				<label className="field-label">
					Telefon <span className="font-normal text-ink/45">oder E-Mail</span>
					<input
						className="field-control"
						name="phone"
						type="tel"
						autoComplete="tel"
					/>
				</label>
			</div>
			<label className="field-label">
				Nachricht
				<textarea
					className="field-control min-h-36 resize-y"
					name="message"
					required
					minLength={10}
					maxLength={3000}
					placeholder="Erzähl uns kurz, wie wir helfen können."
				/>
			</label>
			{state === "error" && (
				<p className="rounded-xl bg-clay/10 p-3 text-sm text-clay" role="alert">
					Das hat nicht geklappt. Bitte prüfe deine Angaben und versuche es
					erneut.
				</p>
			)}
			<button
				type="submit"
				className="button-primary w-full disabled:opacity-50"
				disabled={state === "sending"}
			>
				{state === "sending" ? "Wird gesendet …" : "Nachricht senden"}
			</button>
		</form>
	);
}
