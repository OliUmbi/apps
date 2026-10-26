import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

export interface ContentColumn<Row> {
	id: string;
	heading: string;
	render: (record: Row) => ReactNode;
}

const headClass =
	"h-9 bg-layer-1 px-4 text-left text-xs font-semibold uppercase tracking-wider text-fg-disabled";
const cellClass =
	"border-t border-line-subtle px-4 py-3 text-fg-muted align-middle";

export function CollectionTable<Row>({
	rows,
	columns,
	rowKey,
	onOpen,
}: {
	rows: Row[];
	columns: readonly ContentColumn<Row>[];
	rowKey: (record: Row) => string;
	onOpen: (record: Row) => void;
}) {
	return (
		<div className="overflow-x-auto rounded-md border border-line-subtle">
			<table className="w-full min-w-3xl border-collapse text-left text-sm">
				<thead>
					<tr>
						{columns.map((column) => (
							<th key={column.id} scope="col" className={headClass}>
								{column.heading}
							</th>
						))}
						<th scope="col" className={headClass}>
							<span className="sr-only">{m.studio_record_actions()}</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((record) => (
						<tr
							key={rowKey(record)}
							className="border-t border-line-subtle hover:bg-layer-1"
						>
							{columns.map((column) => (
								<td
									key={column.id}
									className={`${cellClass} max-w-sm whitespace-normal`}
								>
									{column.render(record)}
								</td>
							))}
							<td className={cellClass}>
								<Button variant="link" onClick={() => onOpen(record)}>
									{m.studio_open_record()}
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
