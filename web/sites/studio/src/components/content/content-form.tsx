import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { type ReactNode, useState } from "react";
import type { z } from "zod";

export interface EditorFieldsProps<Input> {
	values: Input;
	onChange: <Name extends keyof Input>(name: Name, value: Input[Name]) => void;
}

export interface ContentEditor<Row, Input> {
	schema: z.ZodType<Input>;
	initialValues: () => Input;
	valuesFromRecord: (record: Row) => Input;
	renderFields: (props: EditorFieldsProps<Input>) => ReactNode;
}

export function ContentForm<Row, Input>({
	editor,
	record,
	pending,
	error,
	saved,
	onSave,
	onClose,
}: {
	editor: ContentEditor<Row, Input>;
	record: Row | null;
	pending: boolean;
	error: boolean;
	saved: boolean;
	onSave: (values: Input) => void;
	onClose: () => void;
}) {
	const [values, setValues] = useState(() =>
		record ? editor.valuesFromRecord(record) : editor.initialValues(),
	);
	const [validation, setValidation] = useState("");
	const [edited, setEdited] = useState(false);
	const onChange: EditorFieldsProps<Input>["onChange"] = (name, value) => {
		setValues((previous) => ({ ...previous, [name]: value }));
		setEdited(true);
		setValidation("");
	};

	return (
		<Form
			className="grid gap-6 px-4 py-[26px]"
			onSubmit={(event) => {
				event.preventDefault();
				if (pending) return;
				const result = editor.schema.safeParse(values);
				if (!result.success) {
					setValidation(
						result.error.issues.map((issue) => issue.message).join(" · "),
					);
					return;
				}
				setValidation("");
				onSave(result.data);
			}}
		>
			<fieldset
				disabled={pending}
				className="grid grid-cols-2 gap-[22px] max-[767px]:grid-cols-1"
			>
				{editor.renderFields({ values, onChange })}
			</fieldset>
			<FormFeedback
				error={validation || (error ? m.error_generic() : null)}
				success={saved && !edited ? m.studio_content_saved() : null}
			/>
			<footer className="flex justify-end gap-2.5 border-t border-border-soft pt-5">
				<Button
					type="button"
					className="button"
					disabled={pending}
					onClick={onClose}
				>
					{m.cancel()}
				</Button>
				<Button type="submit" className="button primary" disabled={pending}>
					{pending ? m.saving() : m.save()}
				</Button>
			</footer>
		</Form>
	);
}
