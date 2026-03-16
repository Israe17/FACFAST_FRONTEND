import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const CLIENT_API_BASE_URL = "/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshRequest: Promise<void> | null = null;

function getServerBackendUrl() {
  return (process.env.BACKEND_URL?.trim() || "http://localhost:3002").replace(/\/$/, "");
}

function shouldSkipRefresh(url?: string) {
  if (!url) {
    return false;
  }

  return ["/auth/login", "/auth/logout", "/auth/refresh"].some((authRoute) =>
    url.includes(authRoute),
  );
}

function createHttpClient(baseURL: string, cookieHeader?: string) {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
}

export const http = createHttpClient(CLIENT_API_BASE_URL);

if (typeof window !== "undefined") {
  http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const request = error.config as RetryableRequestConfig | undefined;

      if (!request || status !== 401 || request._retry || shouldSkipRefresh(request.url)) {
        return Promise.reject(error);
      }

      request._retry = true;

      refreshRequest ??= http
        .post("/auth/refresh")
        .then(() => undefined)
        .finally(() => {
          refreshRequest = null;
        });

      try {
        await refreshRequest;
        return http(request);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    },
  );
}

export function createServerHttpClient(cookieHeader: string) {
  return createHttpClient(getServerBackendUrl(), cookieHeader);
}

export function getClientApiBaseUrl() {
  return CLIENT_API_BASE_URL;
}
