import { create } from "zustand";

type CheckPoint =
  | "entry_gate"
  | "front_office"
  | "weigh_bridge"
  | "qc"
  | "material_handling";
type UserRole = "admin" | "operator";

interface UserState {
  name: string;
  email: string;
  role: UserRole;
  checkPointAssigned?: CheckPoint;
  isAuthenticated: boolean;
  setUser: (
    user: Omit<UserState, "setUser" | "clearUser" | "isAuthenticated">
  ) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "",
  email: "",
  role: "operator",
  checkPointAssigned: undefined,
  isAuthenticated: false,
  setUser: (user) => set({ ...user, isAuthenticated: true }),
  clearUser: () =>
    set({
      name: "",
      email: "",
      role: "operator",
      checkPointAssigned: undefined,
      isAuthenticated: false,
    }),
}));
