import useUserStore from "@/stores/user.store";
import axios from "../api/axios";
import useTab from "@/stores/tab.store";


export async function refreshTokens(originalReq: any) {
    try {
        await axios.get("/user/refresh-tokens")
        return axios(originalReq)
    } catch (err) {
        useUserStore.persist.clearStorage()
        useTab.persist.clearStorage()
        window.location.href = "/signin"
    }
}

export async function useGetUser() {
    const response = await axios.get("/user/current-user")
    useUserStore.getState().setUser(response?.data?.data)
    useUserStore.getState().setIsUserLogged(true)
}

