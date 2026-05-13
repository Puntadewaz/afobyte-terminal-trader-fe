import { create } from "zustand";

interface UiStore {
  selectedMarket: "all" | "crypto" | "idx" | "us";
  analysisMode: "long-term" | "swing" | "intraday";
  isSidebarCollapsed: boolean;
  setMarket: (market: UiStore["selectedMarket"]) => void;
  setAnalysisMode: (mode: UiStore["analysisMode"]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedMarket: "all",
  analysisMode: "swing",
  isSidebarCollapsed: false,
  setMarket: (selectedMarket) => set({ selectedMarket }),
  setAnalysisMode: (analysisMode) => set({ analysisMode }),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
