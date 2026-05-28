import type { NextRequest } from "next/server";
import { envConfig } from "@/config";

const SKIPPED_REQUEST_HEADERS = new Set(["host", "connection"]);

async function handler(req: NextRequest): Promise<Response> {
	const url = new URL(req.url);
	const targetUrl = `${envConfig.apiUrl}${url.pathname}${url.search}`;

	const forwardHeaders = new Headers();
	for (const [key, value] of req.headers.entries()) {
		if (!SKIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
			forwardHeaders.set(key, value);
		}
	}

	const body =
		req.method !== "GET" && req.method !== "HEAD"
			? await req.arrayBuffer()
			: undefined;

	let upstream: Response;
	try {
		upstream = await fetch(targetUrl, {
			method: req.method,
			headers: forwardHeaders,
			body,
		});
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Auth service unavailable";
		return new Response(JSON.stringify({ error: message }), {
			status: 502,
			headers: { "content-type": "application/json" },
		});
	}

	const responseHeaders = new Headers();
	for (const [key, value] of upstream.headers.entries()) {
		if (key.toLowerCase() === "set-cookie") {
			responseHeaders.append("set-cookie", value);
		} else {
			responseHeaders.set(key, value);
		}
	}

	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: responseHeaders,
	});
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
