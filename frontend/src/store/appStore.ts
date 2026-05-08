import { create } from "zustand";

type ActivityType = "assignment" | "challenge" | "quiz" | "exam";

type AppState = {
  currentActivityType: ActivityType;
  setCurrentActivityType: (value: ActivityType) => void;
};

export const useAppStore = create<AppState>((set) => ({
  currentActivityType: "assignment",
  setCurrentActivityType: (value) => set({ currentActivityType: value }),
}));
