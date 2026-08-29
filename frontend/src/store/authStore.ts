import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
    broadcast?: boolean,
  ) => void;
  clearAuth: (broadcast?: boolean) => void;
}

const authChannel = new BroadcastChannel("online-shop-auth");

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken, broadcast = true) => {
        set({
          user,
          accessToken,
          refreshToken,
        });

        if (broadcast) {
          authChannel.postMessage({
            type: "AUTH_LOGGED_IN",
            user,
            accessToken,
            refreshToken,
          });
        }
      },

      clearAuth: (broadcast = true) => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        if (broadcast) {
          authChannel.postMessage({ type: "AUTH_LOGGED_OUT" });
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

authChannel.onmessage = (event) => {
  if (event.data?.type === "AUTH_LOGGED_IN") {
    const { user, accessToken, refreshToken } = event.data;

    if (user && accessToken && refreshToken) {
      useAuthStore.getState().setAuth(user, accessToken, refreshToken, false);
    }
    return;
  }

  if (event.data?.type === "AUTH_LOGGED_OUT") {
    useAuthStore.getState().clearAuth(false);
  }
};