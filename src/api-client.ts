import axios, { AxiosInstance } from "axios";
import { config } from "./config";

const client: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeoutMs,
  headers: {
    "Content-Type": "application/json",
    ...(config.api.apiKey && { Authorization: `Bearer ${config.api.apiKey}` }),
  },
});

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function callApi(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const response = await client.request({
      method,
      url: path,
      data: body,
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `API error: ${error.response?.status ?? "unknown"} - ${error.message}`,
      };
    }
    return { success: false, error: String(error) };
  }
}
