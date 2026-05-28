/**
 * Inline validation feedback after blur (TanStack Form `isTouched`) or after a failed submit.
 */
export function formFieldShowInvalid(
	isTouched: boolean,
	isValid: boolean,
	submissionAttempts = 0,
): boolean {
	return (isTouched || submissionAttempts > 0) && !isValid;
}
