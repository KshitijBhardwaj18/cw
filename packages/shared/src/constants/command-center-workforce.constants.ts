export const COMMAND_CENTER_WORKFORCE_TYPE_KEYS = [
	"internal-full-time",
	"internal-part-time",
	"internal-prn",
	"internal-float-pool",
	"internal-volunteer",
	"external-1099",
	"external-eor",
	"external-vendor-per-diem",
	"external-vendor-lto",
] as const;

export type CommandCenterWorkforceTypeKey =
	(typeof COMMAND_CENTER_WORKFORCE_TYPE_KEYS)[number];

export type CommandCenterWorkforceCounts = Record<
	CommandCenterWorkforceTypeKey,
	number
>;

export const COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS: CommandCenterWorkforceCounts =
	{
		"internal-full-time": 0,
		"internal-part-time": 0,
		"internal-prn": 0,
		"internal-float-pool": 0,
		"internal-volunteer": 0,
		"external-1099": 0,
		"external-eor": 0,
		"external-vendor-per-diem": 0,
		"external-vendor-lto": 0,
	};
