import { AUTH_PORTAL_HEADER, AUTH_PORTAL_ORG, deepTrim } from "@repo/shared";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios, { isAxiosError } from "axios";
import { envConfig } from "@/config";

export class ApiClient {
	private static async getServerSideHeaders(): Promise<Record<string, string>> {
		if (typeof window !== "undefined") {
			return {};
		}

		try {
			const { cookies, headers } = await import("next/headers");
			const cookieStore = await cookies();
			const headerStore = await headers();

			const cookieHeader = cookieStore
				.getAll()
				.map((cookie: { name: string; value: string }) => {
					return `${cookie.name}=${cookie.value}`;
				})
				.join("; ");

			const serverHeaders: Record<string, string> = {};

			if (cookieHeader) {
				serverHeaders.cookie = cookieHeader;
			}

			const authorization = headerStore.get("authorization");
			if (authorization) {
				serverHeaders.authorization = authorization;
			}

			const requestId = headerStore.get("x-request-id");
			if (requestId) {
				serverHeaders["x-request-id"] = requestId;
			}

			const correlationId = headerStore.get("x-correlation-id");
			if (correlationId) {
				serverHeaders["x-correlation-id"] = correlationId;
			}

			return serverHeaders;
		} catch {
			return {};
		}
	}

	static async request<T>(config: AxiosRequestConfig): Promise<T> {
		try {
			const isFormData = config.data instanceof FormData;

			if (config.data && !isFormData) {
				config.data = deepTrim(config.data);
			}
			if (config.params) {
				config.params = deepTrim(config.params);
			}

			const serverHeaders = await ApiClient.getServerSideHeaders();

			const client = axios.create({
				baseURL: typeof window === "undefined" ? envConfig.apiUrl : "",
				withCredentials: config.withCredentials ?? true,
				headers: {
					[AUTH_PORTAL_HEADER]: AUTH_PORTAL_ORG,
					...(config.data && !isFormData
						? { "Content-Type": "application/json" }
						: {}),
					...serverHeaders,
					...config.headers,
				},
			});
			const response: AxiosResponse<T> = await client.request(config);
			return response.data;
		} catch (err) {
			if (isAxiosError(err)) {
				throw new Error(err.response?.data.message || "Something went wrong");
			}
			console.log(err);
			throw new Error("Something went wrong");
		}
	}

	static async get<T>(
		url: string,
		params?: Record<string, unknown>,
	): Promise<T> {
		return ApiClient.request<T>({ method: "GET", url, params });
	}

	static async post<T, D = unknown>(url: string, data?: D): Promise<T> {
		return ApiClient.request<T>({ method: "POST", url, data });
	}

	static async put<T, D = unknown>(url: string, data?: D): Promise<T> {
		return ApiClient.request<T>({ method: "PUT", url, data });
	}

	static async patch<T, D = unknown>(url: string, data?: D): Promise<T> {
		return ApiClient.request<T>({ method: "PATCH", url, data });
	}

	static async delete<T>(
		url: string,
		params?: Record<string, unknown>,
	): Promise<T> {
		return ApiClient.request<T>({ method: "DELETE", url, params });
	}

	static async getBlob(
		url: string,
		params?: Record<string, unknown>,
	): Promise<Blob> {
		return ApiClient.request<Blob>({
			method: "GET",
			url,
			params,
			responseType: "blob",
		});
	}

	static sse(path: string): EventSource {
		return new EventSource(path, { withCredentials: true });
	}
}
