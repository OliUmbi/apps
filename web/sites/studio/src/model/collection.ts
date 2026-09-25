import type { Page, PageInput } from "@oliumbi/contracts";

export type CollectionSelection<Row> =
	| { mode: "list" }
	| { mode: "create" }
	| { mode: "detail"; id: string; record?: Row };

export interface CollectionNavigation<Row> {
	selection: CollectionSelection<Row>;
	showList: () => void;
	showCreate: () => void;
	showRecord: (record: Row) => void;
}

export interface CollectionSource<Row, Input> {
	collection: string;
	scope?: string;
	rowKey: (record: Row) => string;
	loadPage: (input: PageInput) => Promise<Page<Row>>;
	loadRecord?: (id: string) => Promise<Row | null>;
	create?: (values: Input) => Promise<Row>;
	update?: (record: Row, values: Input) => Promise<Row>;
	remove: (record: Row) => Promise<void>;
}
