import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { displayRecordValue } from "../model/record-display";
import { getResource, type ResourceId } from "../model/resources";

export function RecordDetail({
	resourceId,
	record,
	onClose,
	inline = false,
}: {
	resourceId: ResourceId;
	record: ResourceRecord;
	onClose: () => void;
	inline?: boolean;
}) {
	const resource = getResource(resourceId);
	return (
		<section className={`record-detail ${inline ? "is-inline" : ""}`}>
			<header className="editor-heading">
				<div>
					<p className="page-kicker">{m.studio_record_details()}</p>
					<h2>{resource.label}</h2>
				</div>
				<Button className="button" onClick={onClose}>
					{m.cancel()}
				</Button>
			</header>
			<dl className="record-fields">
				{resource.fields.map((field) => (
					<div
						key={field.name}
						className={
							field.kind === "textarea" ? "record-field-wide" : undefined
						}
					>
						<dt>{field.label}</dt>
						<dd>{displayRecordValue(field, record[field.name])}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

import { Button } from "@base-ui/react/button";
