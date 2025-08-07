import type {
  ShortenRequest,
  ShortenResponse,
  UnshortenRequest,
  UnshortenResponse,
} from "@url-shortener/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async shorten(data: ShortenRequest): Promise<ShortenResponse> {
    return this.request<ShortenResponse>("/shorten", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async unshorten(data: UnshortenRequest): Promise<UnshortenResponse> {
    return this.request<UnshortenResponse>("/unshorten", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
  }> {
    return this.request("/health");
  }
}

export const apiService = new ApiService();
