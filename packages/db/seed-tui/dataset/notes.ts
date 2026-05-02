import { NoteType } from "@repo/db";
import { getDeterministicId, SEED_PREFIX } from "../utils";

export const NOTE_ID = {
	NOTE_1: getDeterministicId(`${SEED_PREFIX}note-1`),
	NOTE_2: getDeterministicId(`${SEED_PREFIX}note-2`),
	NOTE_3: getDeterministicId(`${SEED_PREFIX}note-3`),
	NOTE_4: getDeterministicId(`${SEED_PREFIX}note-4`),
	NOTE_5: getDeterministicId(`${SEED_PREFIX}note-5`),
} as const;

export const getNotesDataset = (
	organizationId: string,
	authorIds: string[],
) => [
	{
		id: NOTE_ID.NOTE_1,
		organizationId,
		type: NoteType.GENERAL,
		notes: "Meeting notes on project alpha progress.",
		createdAt: new Date("2023-11-20"),
		createdBy: authorIds[0 % authorIds.length],
	},
	{
		id: NOTE_ID.NOTE_2,
		organizationId,
		type: NoteType.BILLING,
		notes: "Reviewed code for module X. Found minor issues.",
		createdAt: new Date("2023-11-19"),
		createdBy: authorIds[1 % authorIds.length],
	},
	{
		id: NOTE_ID.NOTE_3,
		organizationId,
		type: NoteType.ISSUE,
		notes: "Security patch required for production server ASAP.",
		createdAt: new Date("2023-11-18"),
		createdBy: authorIds[2 % authorIds.length],
	},
	{
		id: NOTE_ID.NOTE_4,
		organizationId,
		type: NoteType.GENERAL,
		notes: "Followed up with client regarding deliverables.",
		createdAt: new Date("2023-11-17"),
		createdBy: authorIds[3 % authorIds.length],
	},
	{
		id: NOTE_ID.NOTE_5,
		organizationId,
		type: NoteType.REQUEST,
		notes: "Prepared documentation for API endpoints.",
		createdAt: new Date("2023-11-16"),
		createdBy: authorIds[4 % authorIds.length],
	},
];
