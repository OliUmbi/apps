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
	onSave,
	onClose,
}: {
	editor: ContentEditor<Row, Input>;
	record: Row | null;
	pending: boolean;
	error: boolean;
	onSave: (values: Input) => void;
	onClose: () => void;
}) {
	const [values, setValues] = useState(() =>
		record ? editor.valuesFromRecord(record) : editor.initialValues(),
	);
	const [validation, setValidation] = useState("");
	const onChange: EditorFieldsProps<Input>["onChange"] = (name, value) =>
		setValues((previous) => ({ ...previous, [name]: value }));

	return (
		<Form
			className="editor-form"
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
			<fieldset disabled={pending} className="editor-fields">
				{editor.renderFields({ values, onChange })}
			</fieldset>
			<FormFeedback error={validation || (error ? m.error_generic() : null)} />
			<footer className="editor-actions">
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
