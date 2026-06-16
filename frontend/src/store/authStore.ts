import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "admin" | "researcher" | "policy_maker" | "investor" | "public_viewer";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  avatar_url?: string;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("edi_token", token);
        }
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("edi_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: "edi_auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Role helpers
export const ROLE_LABELS: Record<UserRole, string> = {
  admin:         "Admin",
  researcher:    "Researcher",
  policy_maker:  "Policy Maker",
  investor:      "Investor",
  public_viewer: "Public Viewer",
};

export const canSimulate  = (role?: UserRole) => role && ["admin","researcher","policy_maker","investor"].includes(role);
export const canManage    = (role?: UserRole) => role && ["admin","researcher"].includes(role);
export const isAdmin      = (role?: UserRole) => role === "admin";
