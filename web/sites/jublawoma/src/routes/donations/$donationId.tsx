import { m } from "@oliumbi/i18n/messages";
import { commitmentSchema } from "@oliumbi/jublawoma-data/contracts";
import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SubmissionForm } from "../../components/ui/submission-form";
import {
	getDonation,
	submitCommitment,
} from "../../content/donation.functions";

export const Route = createFileRoute("/donations/$donationId")({
	loader: async ({ params }) => {
		const result = await getDonation({ data: params.donationId });
		if (!result) throw notFound();
		return result;
	},
	component: Donation,
});
function Donation() {
	const { record, children } = Route.useLoaderData();
	const router = useRouter();
	const submit = useServerFn(submitCommitment);
	return (
		<section className="shell py-20">
			<h1 className="max-w-3xl text-6xl font-bold">{record.title}</h1>
			<p className="my-6 max-w-2xl text-lg">{record.description}</p>
			<p className="mb-12">
				{m.jublawoma_routes_donations_donationId_paragraph()}
				{record.contact}
			</p>
			<div className="grid gap-6 md:grid-cols-2">
				{children.map((item) => (
					<article
						key={String(item.id)}
						className="rounded-3xl border border-current/15 p-7"
					>
						<h2 className="text-3xl">{item.name}</h2>
						<p className="my-4">{item.description}</p>
						<p className="mb-6">
							{m.jublawoma_routes_donations_donationId_paragraph_2()}
							{item.remaining} / {item.quantity} {item.unit}
						</p>
						{Number(item.remaining) > 0 ? (
							<SubmissionForm
								schema={commitmentSchema}
								defaults={{ donationId: record.id, itemId: item.id }}
								submit={async (data) => {
									const result = await submit({ data });
									await router.invalidate();
									return result;
								}}
								success={m.jublawoma_routes_donations_donationId_success()}
								fields={[
									{
										name: "name",
										label: m.jublawoma_routes_donations_donationId_label(),
										required: true,
									},
									{
										name: "phone",
										label: m.jublawoma_routes_donations_donationId_label_2(),
										type: "tel",
										required: true,
									},
									{
										name: "quantity",
										label: String(item.unit),
										type: "number",
										min: Number(item.step),
										max: Number(item.remaining),
										step: Number(item.step),
										required: true,
									},
									{
										name: "note",
										label: m.jublawoma_routes_donations_donationId_label_3(),
										type: "textarea",
									},
								]}
							/>
						) : (
							<p>{m.jublawoma_donation_complete()}</p>
						)}
					</article>
				))}
			</div>
		</section>
	);
}
