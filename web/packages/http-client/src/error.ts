import { AppError, deriveErrorCode } from "@oliumbi/contracts";
import { emptyProblem, type ServiceProblem } from "./problem";

// The typed failure of one service request. Beyond the HTTP status it carries
// the machine-readable code callers branch on (sign-in vs retry vs conflict vs
// not-found vs validation) and the safe parts of the service's problem body.
// The body itself and any stack stay behind this boundary.
export class ServiceError extends AppError {
	constructor(
		readonly service: string,
		readonly status: number,
		problem: ServiceProblem = emptyProblem,
	) {
		super(
			deriveErrorCode(status, problem.fields.length > 0),
			`${service} request failed (${status})`,
			{
				errorId: problem.errorId,
				detail: problem.detail,
				fields: problem.fields,
			},
		);
		this.name = "ServiceError";
	}
}
