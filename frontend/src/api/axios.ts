import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "/api",
});

const authChannel = new BroadcastChannel("online-shop-auth");

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<Tokens> | null = null;
let lastBroadcastRefreshAt = 0;

const updateAuth = (tokens: Tokens) => {
  const user = useAuthStore.getState().user;

  if (!user) {
    throw new Error("No authenticated user available");
  }

  useAuthStore
    .getState()
    .setAuth(user, tokens.accessToken, tokens.refreshToken, false);
};

authChannel.onmessage = (event) => {
  if (event.data?.type !== "AUTH_REFRESHED") {
    return;
  }

  const { accessToken, refreshToken } = event.data;

  if (!accessToken || !refreshToken) {
    return;
  }

  lastBroadcastRefreshAt = Date.now();

  try {
    updateAuth({ accessToken, refreshToken });
  } catch {
    // The current tab may still be hydrating its auth store.
    // The persisted Zustand state will contain the new tokens.
  }
};

const refreshAccessToken = async (): Promise<Tokens> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  refreshPromise = api
    .post("/auth/refresh", { refreshToken })
    .then((response) => {
      const tokens: Tokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };

      updateAuth(tokens);

      authChannel.postMessage({
        type: "AUTH_REFRESHED",
        ...tokens,
      });

      return tokens;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const waitForAnotherTabToRefresh = async (): Promise<Tokens> => {
  const initialRefreshToken = useAuthStore.getState().refreshToken;
  const startedAt = Date.now();

  await new Promise<void>((resolve) => {
    const check = () => {
      const current = useAuthStore.getState();

      if (
        current.refreshToken &&
        current.refreshToken !== initialRefreshToken
      ) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= 2000) {
        resolve();
        return;
      }

      window.setTimeout(check, 50);
    };

    check();
  });

  const { accessToken, refreshToken } = useAuthStore.getState();

  if (!accessToken || !refreshToken || refreshToken === initialRefreshToken) {
    throw new Error("Another tab did not provide a new refresh token");
  }

  return { accessToken, refreshToken };
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      const timeSinceBroadcast = Date.now() - lastBroadcastRefreshAt;

      if (timeSinceBroadcast < 2000) {
        try {
          const tokens = await waitForAnotherTabToRefresh();
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        } catch {
          // Fall through to the normal session-invalid handling below.
        }
      }

      const latestRefreshToken = useAuthStore.getState().refreshToken;

      if (latestRefreshToken) {
        try {
          const tokens = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        } catch {
          // The session is genuinely unable to refresh.
        }
      }

      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default api;