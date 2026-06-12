import { create } from "zustand";

type TabState = {
  tab: string;
  setTab: (tab: string) => void;
};

const useTab = create<TabState>((set: any) => ({
    tab: "home",
    setTab: (tab: string) => set({ tab: tab }),
}))

export default useTab;
