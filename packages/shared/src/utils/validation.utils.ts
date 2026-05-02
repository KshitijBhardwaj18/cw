import { isPossiblePhoneNumber } from "libphonenumber-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
	if (!value) return "Email is required";
	if (!EMAIL_REGEX.test(value)) return "Invalid email address";
	return undefined;
}

export function validatePhone(value: string): string | undefined {
	if (!value) return undefined;
	return isPossiblePhoneNumber(value) ? undefined : "Invalid phone number";
}
