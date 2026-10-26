// The typed-error vocabulary for managed-content updates is shared and
// table-agnostic (repositories pass their table label in); this entry point
// keeps the package's public surface unchanged.
export {
	ConcurrentUpdateError,
	concurrentUpdateMessage,
	isConcurrentUpdateError,
	RecordKeyMismatchError,
	updateMissError,
} from "@oliumbi/database/content-errors";
