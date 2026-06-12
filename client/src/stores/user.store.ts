import { User } from "@/types";
import { create } from "zustand";

interface UserState {
    user: User | null;
    setUser: (u: User | null) => void;
    isUserLogged: boolean;
    setIsUserLogged: (b: boolean) => void;
};

const useUserStore = create<UserState>((set: any) => ({
    user: null,
    setUser: (user: User | null) => set({ user: user }),
    isUserLogged: false,
    setIsUserLogged: (bool: boolean) => set({ isUserLogged: bool }),
}))

export default useUserStore;
