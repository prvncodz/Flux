import { create } from "zustand";

const useUserStore = create(set => ({
    user: {},
    setUser: (user) => set({ user: user }),
    isUserLogged: false,
    setIsUserLogged: (bool) => set({ isUserLogged: bool }),
}))

export default useUserStore;
