import { User } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware"

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    isUserLogged: boolean;
    setIsUserLogged: (bool: boolean) => void;
};

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: User | null) => set({ user: user }),
            isUserLogged: false,
            setIsUserLogged: (bool: boolean) => set({ isUserLogged: bool }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useUserStore;
