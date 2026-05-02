/**
 * Unique id for client-only keys (e.g. list row ids). Uses `crypto.randomUUID()` when
 * available; otherwise falls back (some HTTP contexts / older runtimes omit it).
 */
export function createClientId(): string {
	const c = globalThis.crypto;
	if (c && typeof c.randomUUID === "function") {
		return c.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
