import { isPossiblePhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const zipCodeSchema = z
	.string()
	.trim()
	.regex(/^\d{5}(-\d{4})?$/, "ZIP code must be in correct format");

export const requiredPhoneSchema = z
	.string()
	.trim()
	.min(1, "Phone number is required")
	.refine(
		(val) => !val || isPossiblePhoneNumber(val),
		"Invalid phone number format",
	);

export const optionalPhoneSchema = z
	.string()
	.trim()
	.refine(
		(val) => !val || isPossiblePhoneNumber(val),
		"Invalid phone number format",
	)
	.optional();
