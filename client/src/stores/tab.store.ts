import { create } from "zustand";

const useTab = create(set => ({
    tab: "home",
    setTab: (tab) => set({ tab: tab }),
}))

export default useTab;
