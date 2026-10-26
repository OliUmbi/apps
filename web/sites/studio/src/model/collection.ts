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

// What a collection reads and deletes. Writing is a separate, explicit
// capability (see the capability union in components/content/collection).
export interface CollectionSource<Row> {
	collection: string;
	scope?: string;
	rowKey: (record: Row) => string;
	loadPage: (input: PageInput) => Promise<Page<Row>>;
	loadRecord?: (id: string) => Promise<Row | null>;
	remove: (record: Row) => Promise<void>;
}

// The mutation pair the save mutation switches over. The collection views
// derive it from the capability; read-only collections pass neither.
export interface CollectionEditing<Row, Input> {
	create?: (values: Input) => Promise<Row>;
	update?: (record: Row, values: Input) => Promise<Row>;
}
