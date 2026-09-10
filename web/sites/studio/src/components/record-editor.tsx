import { type ResourceRecord, resourceSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useState } from "react";
import { getResource, type ResourceId } from "../studio/resources";
import { ResourceField } from "./resource-field";
import { Button, Dialog, Form, FormFeedback } from "./ui/index";
export function RecordEditor({
	resourceId,
	record,
	onSave,
	onClose,
	pending,
	error,
}: {
	resourceId: ResourceId;
	record: ResourceRecord | null;
	onSave: (values: ResourceRecord) => void;
	onClose: () => void;
	pending: boolean;
	error: boolean;
}) {
	const resource = getResource(resourceId);
	const fields = resource.fields.filter((field) => !field.readOnly);
	const [values, setValues] = useState<ResourceRecord>(() =>
		Object.fromEntries(
			fields.map((field) => [
				field.name,
				record?.[field.name] ??
					(field.kind === "checkbox"
						? false
						: field.nullable
							? null
							: field.kind === "number"
								? (field.min ?? 0)
								: field.kind === "status"
									? "new"
									: ""),
			]),
		),
	);
	const [validation, setValidation] = useState("");
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-60 max-h-[90vh] w-[min(95vw,44rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/15 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
					<Dialog.Title className="mb-2 text-xl">
						{record ? m.edit() : m.create()} · {resource.label}
					</Dialog.Title>
					<Dialog.Description className="mb-6 text-sm text-zinc-400">
						{m.studio_components_record_editor_text()}
					</Dialog.Description>
					<Form
						className="grid gap-5"
						onSubmit={(event) => {
							event.preventDefault();
							const result = resourceSchema(resource).safeParse(values);
							if (!result.success) {
								setValidation(
									result.error.issues
										.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
										.join(" · "),
								);
								return;
							}
							setValidation("");
							onSave(result.data as ResourceRecord);
						}}
					>
						{fields.map((field) => (
							<ResourceField
								key={field.name}
								resourceId={resourceId}
								field={field}
								value={values[field.name]}
								onChange={(value) =>
									setValues((previous) => ({
										...previous,
										[field.name]: value,
									}))
								}
							/>
						))}
						<FormFeedback
							error={validation || (error ? m.error_generic() : null)}
						/>
						<div className="flex justify-end gap-3">
							<Button onClick={onClose} disabled={pending} className="button">
								{m.cancel()}
							</Button>
							<Button
								type="submit"
								disabled={pending}
								className="button primary"
							>
								{pending ? m.saving() : m.save()}
							</Button>
						</div>
					</Form>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
