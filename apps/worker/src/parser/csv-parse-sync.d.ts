declare module "csv-parse/sync" {
	interface ParseOptions {
		columns?: boolean | string[];
		skip_empty_lines?: boolean;
		trim?: boolean;
		bom?: boolean;
		relax_column_count?: boolean;
	}
	export function parse(
		input: Buffer | string,
		options?: ParseOptions,
	): Record<string, string>[];
}
