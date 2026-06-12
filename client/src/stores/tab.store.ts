import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"


interface TabState {
    tab: string;
    setTab: (tab: string) => void;
};

const useTab = create<TabState>()(
    persist(
        (set) => ({
            tab: "home",
            setTab: (tab: string) => set({ tab: tab }),
        }),
        {
            name: "tab-store",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)

export default useTab;
