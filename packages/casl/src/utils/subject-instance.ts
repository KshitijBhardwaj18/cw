import { subject } from "@casl/ability";
import type { AppSubjects } from "../types/subjects";

export function subjectInstance(
	subjectName: AppSubjects & string,
	conditions: Record<string, unknown>,
): AppSubjects {
	return subject(
		subjectName as string,
		conditions as Record<string, unknown>,
	) as unknown as AppSubjects;
}
