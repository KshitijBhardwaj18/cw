export function isS3Key(url: string): boolean {
	return !url.startsWith("http://") && !url.startsWith("https://");
}
