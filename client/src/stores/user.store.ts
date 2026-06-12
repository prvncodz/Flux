import { create } from "zustand";

type UserState = {
  user: any;
  setUser: (u: any) => void;
  isUserLogged: boolean;
  setIsUserLogged: (b: boolean) => void;
};

const useUserStore = create<UserState>((set: any) => ({
    user: {},
    setUser: (user: any) => set({ user: user }),
    isUserLogged: false,
    setIsUserLogged: (bool: boolean) => set({ isUserLogged: bool }),
}))

export default useUserStore;
