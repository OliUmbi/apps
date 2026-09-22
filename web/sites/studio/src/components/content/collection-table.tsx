import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";

export interface ContentColumn<Row> {
	id: string;
	heading: string;
	render: (record: Row) => ReactNode;
}

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
		<div className="data-table">
			<table className="w-full text-left text-sm">
				<thead>
					<tr>
						{columns.map((column) => (
							<th key={column.id} scope="col">
								{column.heading}
							</th>
						))}
						<th scope="col">
							<span className="sr-only">{m.studio_record_actions()}</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((record) => (
						<tr key={rowKey(record)} className="border-t border-white/10">
							{columns.map((column) => (
								<td key={column.id} className="max-w-sm whitespace-normal">
									{column.render(record)}
								</td>
							))}
							<td>
								<Button
									className="button open-record"
									onClick={() => onOpen(record)}
								>
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
