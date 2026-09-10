import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { getResource, type ResourceId } from "../studio/resources";
import { Button, Dialog } from "./ui/index";

export function RecordDetail({
	resourceId,
	record,
	onClose,
}: {
	resourceId: ResourceId;
	record: ResourceRecord;
	onClose: () => void;
}) {
	const resource = getResource(resourceId);
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-60 max-h-[90vh] w-[min(95vw,44rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-white/15 bg-zinc-900 p-6 text-white">
					<Dialog.Title className="text-xl">{resource.label}</Dialog.Title>
					<Dialog.Description>{m.studio_record_details()}</Dialog.Description>
					<dl className="my-6 grid gap-4">
						{resource.fields.map((field) => (
							<div key={field.name} className="border-t border-white/10 pt-3">
								<dt className="text-sm text-zinc-400">{field.label}</dt>
								<dd className="mt-1 whitespace-pre-wrap break-words">
									{record[field.name] === null
										? "—"
										: typeof record[field.name] === "boolean"
											? record[field.name]
												? m.studio_yes()
												: m.studio_no()
											: String(record[field.name] ?? "—")}
								</dd>
							</div>
						))}
					</dl>
					<Button className="button" onClick={onClose}>
						{m.cancel()}
					</Button>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
